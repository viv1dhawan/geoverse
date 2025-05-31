import { Blog } from "@/types/blog";

const blogData: Blog[] = [
  {
    id: 1,
    title: "ERT Basic Principle, Different Array Techniques Data Acquisition and Data Interpretation",
    paragraph: "",
    image: "/images/blog/blog-01.jpg",
    author: {
      name: "Vivek Dhawan",
      image: "/images/blog/author-01.png",
      designation: "Geophysicist/ML Engineer",
    },
    tags: ["ERT", "Data Interpretation"], // Example tags
    publishDate: "2025", // Example date
  },
  {
    id: 2,
    title: "Gravity Basic Principle and Different Anomalies,Data Acquisition, Correction and Interpretation",
    paragraph:
      "",
    image: "/images/blog/blog-02.jpg",
    author: {
      name: "Vivek Dhawan",
      image: "/images/blog/author-01.png",
      designation: "Geophysicist/ML Engineer",
    },
    tags: ["Gravity","Anomalies", "Data Interpretation"], // Example tags
    publishDate: "2025", // Example date
  },
  {
    id: 3,
    title: "Seismic/Seismology Basic Principle, Data Acquisition, Processing and Interpretation",
    paragraph:
      "",
    image: "/images/blog/blog-03.jpg",
    author: {
      name: "Vivek Dhawan",
      image: "/images/blog/author-01.png",
      designation: "Geophysicist/ML Engineer",
    },
    tags: ["Seismic", "Seismology", "Data Interpretation"], // Example tags
    publishDate: "2025", // Example date
  },
];
export default blogData;
