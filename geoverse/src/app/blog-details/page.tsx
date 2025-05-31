import SharePost from "@/components/Blog/SharePost";
import TagButton from "@/components/Blog/TagButton";
import Image from "next/image";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Welcome to Geoverse",
  description: "",
  // other metadata
};

const BlogDetailsPage = () => {
  return (
    <>
      <section className="pb-[120px] pt-[150px]">
        <div className="container">
          <div className="-mx-4 flex flex-wrap justify-center">
            <div className="w-full px-4 lg:w-8/12">
              <div>
                <h2 className="mb-8 text-3xl font-bold leading-tight text-black dark:text-white sm:text-4xl sm:leading-tight">
                  ERT Basic Principle, Different Aaary Techniques Data Acquisition and Data Interpretation 
                </h2>
                <div className="mb-10 flex flex-wrap items-center justify-between border-b border-body-color border-opacity-10 pb-4 dark:border-white dark:border-opacity-10">
                  <div className="flex flex-wrap items-center">
                    <div className="mb-5 mr-10 flex items-center">
                      <div className="mr-4">
                        <div className="relative h-10 w-10 overflow-hidden rounded-full">
                          <Image
                            src="/images/blog/author-01.png"
                            alt="author"
                            fill
                          />
                        </div>
                      </div>
                      <div className="w-full">
                        <span className="mb-1 text-base font-medium text-body-color">
                          By <span>Vivek Dhawan</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                <div className="mb-10 text-base font-medium leading-relaxed text-body-color sm:text-lg sm:leading-relaxed lg:text-base lg:leading-relaxed xl:text-lg xl:leading-relaxed">
                  <h2><strong>ERT Basic Principle:</strong></h2>
                  <p>Electrical Resistivity Tomography (ERT) measures subsurface resistivity by injecting current through electrodes and measuring potential differences. Variations in resistivity help map underground features like faults, water tables, or mineral deposits.</p>
                  
                  <div className="mb-10 w-full overflow-hidden rounded">
                    <div className="relative aspect-[97/60] w-full sm:aspect-[97/44]">
                      <Image
                        src="/images/blog/blog-details-02.jpg"
                        alt="ERT diagram"
                        fill
                        className="object-cover object-center"
                      />
                    </div>
                  </div>
                </div>

                <div className="mb-8 text-base font-medium leading-relaxed text-body-color sm:text-lg sm:leading-relaxed lg:text-base lg:leading-relaxed xl:text-lg xl:leading-relaxed">
                  <h1><strong>1. Wenner Array</strong></h1>
                  <p>Electrodes are placed in a straight line with equal spacing. It's commonly used for medium-depth surveys as it provides a good balance between depth and resolution.</p>
                  <center>
                    <div className="formula">
                      ρ = <span id="numerator">ΔV</span> / <span id="denominator">2π ⋅ AB</span>
                    </div>
                  </center>
                  <div>
                    <p><strong>Where:</strong></p>
                    <p style={{ marginLeft: "40px" }}>* A and B are the spacing between the electrodes.</p>
                    <p style={{ marginLeft: "40px" }}>* ΔV is the potential difference between the potential electrodes.</p>
                  </div>

                  <div>
                    <p><strong>Advantages:</strong></p>
                    <p style={{ marginLeft: "40px" }}>* Simple and commonly used for shallow to moderate depths.</p>
                    <p style={{ marginLeft: "40px" }}>* Suitable for detecting broad anomalies.</p>
                  </div>

                  <div>
                    <p><strong>Disadvantages:</strong></p>
                    <p style={{ marginLeft: "40px" }}>* Poor resolution for deep investigations.</p>
                    <p style={{ marginLeft: "40px" }}>* Less sensitive to vertical structures.</p>
                  </div>
                </div>

                <div className="mb-8 text-base font-medium leading-relaxed text-body-color sm:text-lg sm:leading-relaxed lg:text-base lg:leading-relaxed xl:text-lg xl:leading-relaxed">
                  <h1><strong>2. Schlumberger Array</strong></h1>
                  <p>Electrodes are placed symmetrically with the spacing between the current electrodes larger than the potential electrodes. This array allows for deeper measurements and higher resolution at depth.</p>
                  <center>
                  <div className="formula">
                    ρ = <span id="numerator">π ⋅ (A + B)</span> / <span id="denominator">ΔV</span> ⋅ <span id="multiplier">(A + B)</span>
                  </div>
                  </center>
                  <div>
                    <p><strong>Where:</strong></p>
                    <p style={{ marginLeft: "40px" }}>* A is the distance between the potential electrodes.</p>
                    <p style={{ marginLeft: "40px" }}>* B is the spacing between the current electrodes</p>
                    <p style={{ marginLeft: "40px" }}>* ΔV is the potential difference between the potential electrodes.</p>
                  </div>

                  <div>
                    <p><strong>Advantages:</strong></p>
                    <p style={{ marginLeft: "40px" }}>* Good for deeper investigations.</p>
                    <p style={{ marginLeft: "40px" }}>* Higher depth resolution and sensitivity to lateral resistivity changes.</p>
                  </div>

                  <div>
                    <p><strong>Disadvantages:</strong></p>
                    <p style={{ marginLeft: "40px" }}>* Requires a larger area to deploy.</p>
                    <p style={{ marginLeft: "40px" }}>* Slower data collection compared to other arrays.</p>
                  </div>
                </div>

                <div className="mb-8 text-base font-medium leading-relaxed text-body-color sm:text-lg sm:leading-relaxed lg:text-base lg:leading-relaxed xl:text-lg xl:leading-relaxed">
                  <h1><strong>3. Dipole-Dipole Array</strong></h1>
                  <p>Two current electrodes and two potential electrodes are used in a non-symmetric arrangement. This array is effective for detecting small-scale, shallow anomalies and provides high resolution in the near-surface.</p>
                  <center>
                  <div className="formula">
                    ρ = <span id="constant">K</span> ⋅ <span id="numerator">ΔV</span> / <span id="denominator">I</span>
                  </div>
                  </center>
                  <div>
                    <p><strong>Where:</strong></p>
                    <p style={{ marginLeft: "40px" }}>* K is the geometric factor depending on the spacing of the electrodes</p>
                    <p style={{ marginLeft: "40px" }}>* I is the injected current</p>
                    <p style={{ marginLeft: "40px" }}>* ΔV is the measured potential difference</p>
                  </div>

                  <div>
                    <p><strong>Advantages:</strong></p>
                    <p style={{ marginLeft: "40px" }}>* High resolution in the near-surface.</p>
                    <p style={{ marginLeft: "40px" }}>* Sensitive to small-scale anomalies (e.g., fractures or voids).</p>
                  </div>

                  <div>
                    <p><strong>Disadvantages:</strong></p>
                    <p style={{ marginLeft: "40px" }}>* Limited depth of investigation.</p>
                    <p style={{ marginLeft: "40px" }}>* More sensitive to noise.</p>
                  </div>
                </div>

                <div className="mb-8 text-base font-medium leading-relaxed text-body-color sm:text-lg sm:leading-relaxed lg:text-base lg:leading-relaxed xl:text-lg xl:leading-relaxed">
                  <h1><strong>4. Pole-Pole Array</strong></h1>
                  <p>A single current electrode is used with two potential electrodes. This array is effective for detecting deep anomalies and large-scale geological structures.</p>
                  <center>
                  <div className="formula">
                    ρ = <span id="constant"></span><span id="numerator">2π ⋅ A</span> / <span id="denominator">ΔV</span>
                  </div>
                  </center>
                  <div>
                    <p><strong>Where:</strong></p>
                    <p style={{ marginLeft: "40px" }}>* A is the distance between the current electrode and the potential electrode.</p>
                    <p style={{ marginLeft: "40px" }}>* ΔV is the potential difference between the potential electrodes.</p>
                  </div>

                  <div>
                    <p><strong>Advantages:</strong></p>
                    <p style={{ marginLeft: "40px" }}>* Best suited for deep investigations.</p>
                    <p style={{ marginLeft: "40px" }}>* Good for large-scale geological features.</p>
                  </div>

                  <div>
                    <p><strong>Disadvantages:</strong></p>
                    <p style={{ marginLeft: "40px" }}>* Poor resolution in shallow areas.</p>
                    <p style={{ marginLeft: "40px" }}>* Less effective for detecting small anomalies.</p>
                  </div>
                </div>

                <div className="mb-8 text-base font-medium leading-relaxed text-body-color sm:text-lg sm:leading-relaxed lg:text-base lg:leading-relaxed xl:text-lg xl:leading-relaxed">
                  <h1><strong>5. Pole-Dipole Array</strong></h1>
                  <p>One current electrode is placed far from the potential electrodes, which makes it effective for exploring deeper structures.</p>
                  <center>
                  <div className="formula">
                    ρ = <span id="constant"></span><span id="numerator">K . ΔV</span> / <span id="denominator">I</span>
                  </div>
                  </center>
                  <div>
                    <p><strong>Where:</strong></p>
                    <p style={{ marginLeft: "40px" }}>* K is the geometric factor for the pole-dipole setup.</p>
                    <p style={{ marginLeft: "40px" }}>* I is the injected current.</p>
                    <p style={{ marginLeft: "40px" }}>* ΔV is the measured potential difference.</p>
                  </div>

                  <div>
                    <p><strong>Advantages:</strong></p>
                    <p style={{ marginLeft: "40px" }}>* Effective for deep investigations.</p>
                    <p style={{ marginLeft: "40px" }}>* Useful for detecting larger, deeper features.</p>
                  </div>

                  <div>
                    <p><strong>Disadvantages:</strong></p>
                    <p style={{ marginLeft: "40px" }}>* Less sensitive to shallow anomalies.</p>
                    <p style={{ marginLeft: "40px" }}>* Requires more space for electrode placement.</p>
                  </div>
                </div>

                <div className="mb-8 text-base font-medium leading-relaxed text-body-color sm:text-lg sm:leading-relaxed lg:text-base lg:leading-relaxed xl:text-lg xl:leading-relaxed">
                  <h1><strong>Data Acquisition</strong></h1>
                  <p>The process of data acquisition in ERT involves measuring the potential difference (Δ𝑉) generated by injecting an electrical current (𝐼) through the ground using a series of electrodes. The following steps are involved:</p>
                  <div>
                    <p style={{ marginLeft: "40px" }}>1. <strong>Electrode Placement:</strong> Electrodes are placed in the ground at specific intervals and configurations (based on the chosen array type).</p>
                    <p style={{ marginLeft: "40px" }}>2. <strong>Current Injection:</strong> A known current (I) is injected through the current electrodes.</p>
                    <p style={{ marginLeft: "40px" }}>3. <strong>Voltage Measurement:</strong> The potential difference (ΔV) is measured between the potential electrodes.</p>
                    <p style={{ marginLeft: "40px" }}>4. <strong>Repetition:</strong> The measurements are repeated at different electrode positions to collect a range of data for analysis.</p>
                  </div>
                </div>

                  <div className="relative z-10 mb-10 overflow-hidden rounded-md bg-primary bg-opacity-10 p-8 md:p-9 lg:p-8 xl:p-9">
                    <p className="text-center text-base font-medium italic text-body-color">
                    Electrical Resistivity Tomography (ERT) uses current injection and potential difference measurement to map subsurface resistivity, helping identify geological features. Various electrode array techniques, like Wenner and Schlumberger, provide different depth and resolution capabilities. Data acquisition involves measuring resistivity at multiple points, while interpretation creates 2D/3D models through inversion. Combining these methods helps accurately explore and analyze subsurface conditions.
                    </p>
                    <span className="absolute left-0 top-0 z-[-1]">
                      <svg
                        width="132"
                        height="109"
                        viewBox="0 0 132 109"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          opacity="0.5"
                          d="M33.0354 90.11C19.9851 102.723 -3.75916 101.834 -14 99.8125V-15H132C131.456 -12.4396 127.759 -2.95278 117.318 14.5117C104.268 36.3422 78.7114 31.8952 63.2141 41.1934C47.7169 50.4916 49.3482 74.3435 33.0354 90.11Z"
                          fill="url(#paint0_linear_111:606)"
                        />
                        <path
                          opacity="0.5"
                          d="M33.3654 85.0768C24.1476 98.7862 1.19876 106.079 -9.12343 108.011L-38.876 22.9988L100.816 -25.8905C100.959 -23.8126 99.8798 -15.5499 94.4164 0.87754C87.5871 21.4119 61.9822 26.677 49.5641 38.7512C37.146 50.8253 44.8877 67.9401 33.3654 85.0768Z"
                          fill="url(#paint1_linear_111:606)"
                        />
                        <defs>
                          <linearGradient
                            id="paint0_linear_111:606"
                            x1="94.7523"
                            y1="82.0246"
                            x2="8.40951"
                            y2="52.0609"
                            gradientUnits="userSpaceOnUse"
                          >
                            <stop stopColor="white" stopOpacity="0.06" />
                            <stop
                              offset="1"
                              stopColor="white"
                              stopOpacity="0"
                            />
                          </linearGradient>
                          <linearGradient
                            id="paint1_linear_111:606"
                            x1="90.3206"
                            y1="58.4236"
                            x2="1.16149"
                            y2="50.8365"
                            gradientUnits="userSpaceOnUse"
                          >
                            <stop stopColor="white" stopOpacity="0.06" />
                            <stop
                              offset="1"
                              stopColor="white"
                              stopOpacity="0"
                            />
                          </linearGradient>
                        </defs>
                      </svg>
                    </span>
                    <span className="absolute bottom-0 right-0 z-[-1]">
                      <svg
                        width="53"
                        height="30"
                        viewBox="0 0 53 30"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <circle
                          opacity="0.8"
                          cx="37.5"
                          cy="37.5"
                          r="37.5"
                          fill="#4A6CF7"
                        />
                        <mask
                          id="mask0_111:596"
                          style={{ maskType: "alpha" }}
                          maskUnits="userSpaceOnUse"
                          x="0"
                          y="0"
                          width="75"
                          height="75"
                        >
                          <circle
                            opacity="0.8"
                            cx="37.5"
                            cy="37.5"
                            r="37.5"
                            fill="#4A6CF7"
                          />
                        </mask>
                        <g mask="url(#mask0_111:596)">
                          <circle
                            opacity="0.8"
                            cx="37.5"
                            cy="37.5"
                            r="37.5"
                            fill="url(#paint0_radial_111:596)"
                          />
                          <g opacity="0.8" filter="url(#filter0_f_111:596)">
                            <circle
                              cx="40.8089"
                              cy="19.853"
                              r="15.4412"
                              fill="white"
                            />
                          </g>
                        </g>
                        <defs>
                          <filter
                            id="filter0_f_111:596"
                            x="4.36768"
                            y="-16.5881"
                            width="72.8823"
                            height="72.8823"
                            filterUnits="userSpaceOnUse"
                            colorInterpolationFilters="sRGB"
                          >
                            <feFlood
                              floodOpacity="0"
                              result="BackgroundImageFix"
                            />
                            <feBlend
                              mode="normal"
                              in="SourceGraphic"
                              in2="BackgroundImageFix"
                              result="shape"
                            />
                            <feGaussianBlur
                              stdDeviation="10.5"
                              result="effect1_foregroundBlur_111:596"
                            />
                          </filter>
                          <radialGradient
                            id="paint0_radial_111:596"
                            cx="0"
                            cy="0"
                            r="1"
                            gradientUnits="userSpaceOnUse"
                            gradientTransform="translate(37.5 37.5) rotate(90) scale(40.2574)"
                          >
                            <stop stopOpacity="0.47" />
                            <stop offset="1" stopOpacity="0" />
                          </radialGradient>
                        </defs>
                      </svg>
                    </span>
                  </div> 
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default BlogDetailsPage;
