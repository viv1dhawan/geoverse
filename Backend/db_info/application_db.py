# Backend/db_info/gravity_db.py
import pandas as pd
import io
import sqlalchemy
from datetime import datetime
from typing import List, Optional, Dict, Any
import database 
from models import gravity_data, earthquakes

# --- Gravity Data Operations ---

async def load_gravity_data_from_csv(csv_contents: bytes) -> int:
    """
    Loads gravity data from a CSV file into the database.
    Assumes CSV has 'latitude', 'longitude', 'elevation', 'gravity' columns.
    Clears existing gravity data before inserting new data.
    """
    df = pd.read_csv(io.BytesIO(csv_contents))

    # Validate required columns
    required_columns = ['latitude', 'longitude', 'elevation', 'gravity']
    if not all(col in df.columns for col in required_columns):
        raise ValueError(f"CSV must contain the following columns: {', '.join(required_columns)}")

    # Convert DataFrame to a list of dictionaries for insertion
    records_to_insert = df[required_columns].to_dict(orient="records")

    # Clear existing data before bulk insert
    await clear_gravity_data()

    # Bulk insert the new data
    if records_to_insert:
        query = gravity_data.insert()
        await database.execute_many(query, records_to_insert)
    return len(records_to_insert)

async def get_gravity_data() -> pd.DataFrame:
    """
    Retrieves all gravity data from the database and returns it as a Pandas DataFrame.
    """
    query = gravity_data.select()
    records = await database.fetch_all(query)
    if not records:
        return pd.DataFrame(columns=['id', 'latitude', 'longitude', 'elevation', 'gravity', 'bouguer', 'cluster', 'anomaly', 'distance_km']) # Return empty DataFrame with all possible columns
    
    # Convert records to a list of dictionaries and then to DataFrame
    df = pd.DataFrame([dict(record) for record in records])
    return df

async def clear_gravity_data() -> None:
    """
    Clears all gravity data from the database.
    """
    query = gravity_data.delete()
    await database.execute(query)

async def update_gravity_data(df: pd.DataFrame) -> None:
    """
    Updates existing gravity data in the database based on the DataFrame.
    This function assumes the DataFrame contains an 'id' column for existing records.
    If 'id' is not present, it will re-insert all data (less efficient).
    For calculated fields (bouguer, cluster, anomaly, distance_km), it updates them.
    """
    if 'id' not in df.columns:
        # If no ID, clear and re-insert (less efficient but ensures data is consistent)
        print("Warning: 'id' column not found in DataFrame for update. Clearing and re-inserting gravity data.")
        await clear_gravity_data()
        records_to_insert = df.to_dict(orient="records")
        if records_to_insert:
            query = gravity_data.insert()
            await database.execute_many(query, records_to_insert)
    else:
        # Update existing records based on ID
        for index, row in df.iterrows():
            record_id = row['id']
            update_values = {
                'latitude': row.get('latitude'),
                'longitude': row.get('longitude'),
                'elevation': row.get('elevation'),
                'gravity': row.get('gravity'),
                'bouguer': row.get('bouguer'),
                'cluster': row.get('cluster'),
                'anomaly': row.get('anomaly'),
                'distance_km': row.get('distance_km'),
            }
            # Filter out None values to avoid updating columns to None if not present in df
            update_values = {k: v for k, v in update_values.items() if v is not None}

            if update_values: # Only execute if there are values to update
                query = gravity_data.update().where(gravity_data.c.id == record_id).values(**update_values)
                await database.execute(query)

# --- Earthquake Data Operations ---

async def get_earthquakes(
    start_date: datetime,
    end_date: datetime,
    min_mag: Optional[float] = None,
    max_mag: Optional[float] = None,
    min_depth: Optional[float] = None,
    max_depth: Optional[float] = None,
) -> List[Dict[str, Any]]:
    """
    Fetches earthquake data from the database based on various filters.
    """
    query = earthquakes.select().where(
        earthquakes.c.time >= start_date,
        earthquakes.c.time <= end_date
    )

    if min_mag is not None:
        query = query.where(earthquakes.c.mag >= min_mag)
    if max_mag is not None:
        query = query.where(earthquakes.c.mag <= max_mag)
    if min_depth is not None:
        query = query.where(earthquakes.c.depth >= min_depth)
    if max_depth is not None:
        query = query.where(earthquakes.c.depth <= max_depth)

    # Note: Ordering is done in Python as orderBy() can cause index issues in Firestore.
    # For SQL databases, orderBy() is usually fine, but sticking to the general guideline.
    records = await database.fetch_all(query)
    return [dict(record) for record in records]
