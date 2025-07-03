"use client";
import React from "react";

function MainComponent() {
  const [rates, setRates] = React.useState({
    // Mexico banks (USD to MXN)
    "Banco Azteca MX": "",
    Bancoppel: "",
    Bancomer: "",
    Banorte: "",
    "Pago Express": "",
    Soriana: "",
    Walmart: "",
    OXXO: "",
    // Honduras banks (USD to HNL)
    "Banco Atlántida": "",
    "Banco de Occidente": "",
    "Banrural Honduras": "",
    "Banco Azteca HN": "",
    // Guatemala banks (USD to GTQ)
    Banrural: "",
    "Banco Industrial": "",
    "Banco Azteca GT": "",
    // Colombia banks (USD to COP)
    Bancolombia: "",
    "Grupo Éxito": "",
    "Banco Davivienda": "",
    // Haiti banks (USD to HTG)
    Unibank: "",
    Sogebank: "",
    "Capital Bank": "",
  });

  const [errors, setErrors] = React.useState({});
  const [logoType, setLogoType] = React.useState("intermex");
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [selectedCountries, setSelectedCountries] = React.useState([
    "Mexico",
    "Honduras",
    "Guatemala",
    "Colombia",
    "Haiti",
  ]);
  const [showPreview, setShowPreview] = React.useState(false);
  const [previewContent, setPreviewContent] = React.useState("");
  const [previewType, setPreviewType] = React.useState("");

  const countries = {
    Mexico: {
      currency: "MXN",
      flag: "🇲🇽",
      banks: [
        "Banco Azteca MX",
        "Bancoppel",
        "Bancomer",
        "Banorte",
        "Pago Express",
        "Soriana",
        "Walmart",
        "Bodega Aurrerá",
        "Farmacias Guadalajara",
        "OXXO",
      ],
    },
    Honduras: {
      currency: "HNL",
      flag: "🇭🇳",
      banks: [
        "Banco Atlántida",
        "Banco de Occidente",
        "Banrural Honduras",
        "Banco Azteca HN",
      ],
    },
    Guatemala: {
      currency: "GTQ",
      flag: "🇬🇹",
      banks: ["Banrural", "Banco Industrial", "Banco Azteca GT"],
    },
    Colombia: {
      currency: "COP",
      flag: "🇨🇴",
      banks: ["Bancolombia", "Grupo Éxito", "Banco Davivienda"],
    },
    Haiti: {
      currency: "HTG",
      flag: "🇭🇹",
      banks: ["Unibank", "Sogebank", "Capital Bank"],
    },
  };

  const validateRate = (value) => {
    if (!value) return false;
    const num = parseFloat(value);
    if (isNaN(num) || num <= 0) return false;
    // Check if it has at most 2 decimal places
    const decimalPart = value.split(".")[1];
    return !decimalPart || decimalPart.length <= 2;
  };

  const handleRateChange = (bank, value) => {
    setRates((prev) => ({ ...prev, [bank]: value }));

    if (value && !validateRate(value)) {
      setErrors((prev) => ({
        ...prev,
        [bank]: "Debe ser un número válido con hasta 2 decimales",
      }));
    } else {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[bank];
        return newErrors;
      });
    }
  };

  const allFieldsValid = () => {
    const allBanks = Object.keys(rates);
    return (
      allBanks.every((bank) => rates[bank] && validateRate(rates[bank])) &&
      Object.keys(errors).length === 0
    );
  };

  const getCurrentDate = () => {
    return new Date().toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Helper to preload flag images and store logo
  async function preloadImages(
    flagImages,
    selectedCountries,
    storeLogoPath,
    cornerLogoPath
  ) {
    const flagPromises = selectedCountries.map(
      (country) =>
        new Promise((resolve) => {
          const img = new window.Image();
          img.src = flagImages[country] || "";
          img.onload = () => resolve({ country, img });
          img.onerror = () => resolve({ country, img: null });
        })
    );
    // Preload store logo (header)
    const storeLogoPromise = new Promise((resolve) => {
      const img = new window.Image();
      img.src = storeLogoPath;
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
    });
    // Preload corner logo
    const cornerLogoPromise = new Promise((resolve) => {
      const img = new window.Image();
      img.src = cornerLogoPath;
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
    });
    const flagResults = await Promise.all(flagPromises);
    const storeLogoImg = await storeLogoPromise;
    const cornerLogoImg = await cornerLogoPromise;
    return {
      flagMap: Object.fromEntries(
        flagResults.map(({ country, img }) => [country, img])
      ),
      storeLogoImg,
      cornerLogoImg,
    };
  }

  const generateTemplate = async (format, preview = false) => {
    if (!allFieldsValid()) return;

    setIsGenerating(true);
    let generatedContent = "";

    if (format === "png") {
      // Create a canvas for the PNG template (Portrait orientation)
      const canvas = document.createElement("canvas");

      // --- PNG Export Drawing Logic with Comments ---

      // Set up dimensions
      const headerHeight = 150; // Height of the header/logo bar
      const canvasHeight = 1300; // Height of the PNG
      const canvasWidth = Math.round(canvasHeight * 1.3); // Proportional width (e.g., 1.3:1 ratio)
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;

      // Get the 2D drawing context
      const ctx = canvas.getContext("2d");

      // Draw background gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height); // Vertical gradient
      gradient.addColorStop(0, "#f8f9fa"); // Top color
      gradient.addColorStop(1, "#e9ecef"); // Bottom color
      ctx.fillStyle = gradient; // Set fill style
      ctx.fillRect(0, 0, canvas.width, canvas.height); // Fill the background

      // Draw header bar
      ctx.fillStyle = logoType === "intermex" ? "#e74c3c" : "#3498db"; // Header color based on logo
      ctx.fillRect(0, 0, canvas.width, headerHeight); // Header rectangle

      // Draw logo placeholder (rectangle + text)
      ctx.fillStyle = "#ffffff"; // Logo background
      ctx.strokeStyle = "#ffffff"; // Logo border
      ctx.lineWidth = 2; // Logo border width
      ctx.strokeRect(60, 15, 70, 50); // Logo rectangle
      ctx.font = "12px Arial"; // Logo text font
      ctx.textAlign = "center"; // Center text
      ctx.fillText("LOGO", 95, 42); // Draw logo text

      // --- Flag image sources for each country (replace with your own paths) ---
      const flagImages = {
        Mexico: "/flags/mexico.png",
        Honduras: "/flags/honduras.png",
        Guatemala: "/flags/guatemala.png",
        Colombia: "/flags/colombia.png",
        Haiti: "/flags/haiti.png",
      };
      // Dynamically set the store logo path based on logoType
      const storeLogoPath =
        logoType === "intermex" ? "/intermex.png" : "/ria.png";
      const cornerLogoPath = "/storelogo.png"; // Path to your actual store logo (corner)

      // Preload all flag images, store logo, and corner logo before drawing
      const { flagMap, storeLogoImg, cornerLogoImg } = await preloadImages(
        flagImages,
        selectedCountries,
        storeLogoPath,
        cornerLogoPath
      );

      // --- Draw store logo image in header (centered, preserve aspect ratio) ---
      const logoHeight = headerHeight;
      if (
        storeLogoImg &&
        storeLogoImg.naturalWidth &&
        storeLogoImg.naturalHeight
      ) {
        // Calculate width to preserve aspect ratio
        const aspectRatio =
          storeLogoImg.naturalWidth / storeLogoImg.naturalHeight;
        const logoWidth = logoHeight * aspectRatio;
        ctx.drawImage(
          storeLogoImg,
          canvas.width / 2 - logoWidth / 2,
          0,
          logoWidth,
          logoHeight
        ); // Centered, preserves aspect ratio
      } else {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(
          canvas.width / 2 - logoHeight / 2,
          0,
          logoHeight,
          logoHeight
        ); // Placeholder square
        ctx.font = "bold 32px Arial";
        ctx.fillStyle = "#888";
        ctx.textAlign = "center";
        ctx.fillText("LOGO", canvas.width / 2, logoHeight / 2 + 10);
      }

      // --- Draw actual store logo in the top-left corner ---
      if (
        cornerLogoImg &&
        cornerLogoImg.naturalWidth &&
        cornerLogoImg.naturalHeight
      ) {
        // Draw at 120x120px, 30px from top and left
        ctx.drawImage(cornerLogoImg, 30, 30, 120, 120);
      }

      // Draw date below header
      ctx.fillStyle = "#2c3e50"; // Date color
      ctx.font = "18px Arial"; // Date font
      ctx.fillText(getCurrentDate(), canvas.width / 2, headerHeight + 40); // Centered date

      // Draw main title
      ctx.font = "bold 38px Arial"; // Title font
      ctx.fillText("TIPOS DE CAMBIO", canvas.width / 2, headerHeight + 80); // Centered title

      // --- Column Layout Setup ---
      const column1X = 15; // X position for left column (close to left edge)
      const column2X = canvas.width / 2 + 50; // X position for right column (with right margin)
      let currentY1 = headerHeight + 100; // Starting Y for left column (pushed down)
      let currentY2 = headerHeight + 100; // Starting Y for right column (pushed down)
      const lineHeight = 18; // Height for each bank row
      const sectionSpacing = 10; // Space between country sections

      // --- Country Distribution Logic ---
      let countriesForColumns = [...selectedCountries]; // Copy selected countries
      // Swap Honduras and Guatemala if both are present
      const idxHonduras = countriesForColumns.indexOf("Honduras");
      const idxGuatemala = countriesForColumns.indexOf("Guatemala");
      if (idxHonduras !== -1 && idxGuatemala !== -1) {
        [countriesForColumns[idxHonduras], countriesForColumns[idxGuatemala]] =
          [countriesForColumns[idxGuatemala], countriesForColumns[idxHonduras]];
      }
      const countriesInColumns = [[], []]; // [leftColumn, rightColumn]
      countriesForColumns.forEach((country, index) => {
        countriesInColumns[index % 2].push(country); // Alternate countries between columns
      });
      // Ensure Haiti is always in the right column
      const leftIdx = countriesInColumns[0].indexOf("Haiti");
      if (leftIdx !== -1) {
        countriesInColumns[0].splice(leftIdx, 1); // Remove from left
        countriesInColumns[1].push("Haiti"); // Add to right
      }

      // --- Draw Each Column ---
      countriesInColumns.forEach((columnCountries, columnIndex) => {
        let currentY = columnIndex === 0 ? currentY1 : currentY2; // Track Y for each column
        const columnX = columnIndex === 0 ? column1X : column2X; // X for this column

        columnCountries.forEach((countryName) => {
          const countryData = countries[countryName]; // Get country data
          if (!countryData) return; // Skip if not found

          // Add top padding before country section
          currentY += 18;

          // --- Draw flag image (or placeholder if not loaded) ---
          const flagImg = flagMap[countryName];
          if (flagImg) {
            ctx.drawImage(flagImg, columnX, currentY, 50, 30); // Draw flag image 50x30px
          } else {
            ctx.fillStyle = "#28a745"; // Placeholder background
            ctx.fillRect(columnX, currentY, 50, 30); // Placeholder rectangle
            ctx.fillStyle = "#ffffff";
            ctx.font = "16px Arial";
            ctx.textAlign = "center";
            ctx.fillText("FLAG", columnX + 25, currentY + 20); // Placeholder text
          }

          // Draw country title
          ctx.fillStyle = "#2c3e50"; // Title color
          ctx.font = "bold 30px Arial"; // Country title font (large)
          ctx.textAlign = "left"; // Left align
          ctx.fillText(
            `${countryName.toUpperCase()} (USD → ${countryData.currency})`, // Title text
            columnX + 60, // X position after flag image
            currentY + 24 // Y position aligned with flag
          );
          currentY += 55; // Space after country title

          // --- Draw Each Bank Row ---
          countryData.banks.forEach((bank) => {
            currentY += 10; // Padding above each bank row
            // Removed bank logo placeholder

            // Draw bank name (prominent)
            ctx.fillStyle = "#2c3e50"; // Bank name color
            ctx.font = "bold 22px Arial"; // Bank name font
            ctx.textAlign = "left"; // Left align
            ctx.fillText(`${bank}:`, columnX + 10, currentY + 8); // Shifted bank name left

            // Draw exchange rate (most prominent)
            ctx.fillStyle = "#27ae60"; // Rate color
            ctx.font = "bold 26px Arial"; // Rate font
            ctx.textAlign = "right"; // Right align
            ctx.fillText(
              `${rates[bank]} ${countryData.currency}`, // Rate text
              columnX + canvas.width / 2 - 100, // Shifted rate left
              currentY + 8 // Y position
            );
            currentY += 40; // Space after each bank row
          });

          currentY += 24; // Bottom padding after country section
        });

        // Update Y tracker for this column
        if (columnIndex === 0) {
          currentY1 = currentY;
        } else {
          currentY2 = currentY;
        }
      });

      // --- Draw Vertical Divider Between Columns ---
      const dividerX = canvas.width / 2 + 10; // X position for divider
      const dividerStartY = headerHeight + 90; // Start below the title
      const dividerEndY = canvas.height - 40; // End with bottom padding
      ctx.strokeStyle = "#bdc3c7"; // Divider color
      ctx.lineWidth = 3; // Divider width
      ctx.beginPath(); // Start divider path
      ctx.moveTo(dividerX, dividerStartY); // Divider start point
      ctx.lineTo(dividerX, dividerEndY); // Divider end point
      ctx.stroke(); // Draw divider

      // --- Finalize PNG Export ---
      generatedContent = canvas.toDataURL("image/png"); // Export as PNG

      if (preview) {
        setPreviewContent(generatedContent);
        setPreviewType("image");
        setShowPreview(true);
      } else {
        const link = document.createElement("a");
        link.download = `exchange-rates-${
          new Date().toISOString().split("T")[0]
        }.png`;
        link.href = generatedContent;
        link.click();
      }
    } else if (format === "pdf") {
      // Create HTML for PDF with enhanced design
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>Exchange Rates - ${getCurrentDate()}</title>
            <style>
              @page {
                margin: 0;
                size: 850px 1100px;
              }
              body {
                margin: 0;
              }
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body { 
                font-family: 'Arial', sans-serif; 
                background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
                color: #111;
              }
              .container {
                max-width: 850px;
                min-height: 1100px;
                margin: 0 auto;
                background: white;
                padding: 80px;
                box-shadow: 0 0 20px rgba(0,0,0,0.1);
              }
              .header { 
                background: linear-gradient(135deg, ${
                  logoType === "intermex"
                    ? "#e74c3c, #c0392b"
                    : "#3498db, #2980b9"
                }); 
                color: #fff; 
                padding: 18px 30px 14px 30px;
                display: flex;
                align-items: center;
                justify-content: center;
                position: relative;
                border-radius: 8px;
                margin-bottom: 6px;
              }
              .logo-placeholder {
                position: absolute;
                left: 30px;
                width: 80px;
                height: 60px;
                border: 2px solid white;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 12px;
                font-weight: bold;
              }
              .company-name { 
                font-size: 42px; 
                font-weight: bold; 
                text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
              }
              .date-title {
                text-align: center;
                padding: 10px 0 10px 0;
                background: #f8f9fa;
                border-radius: 8px;
                margin-bottom: 8px;
              }
              .date { 
                font-size: 18px; 
                color: #111; 
                margin-bottom: 10px;
                font-weight: bold;
              }
              .title { 
                font-size: 32px; 
                font-weight: bold; 
                color: #111;
                letter-spacing: 2px;
              }
              .rates-container {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 30px;
                padding: 0;
              }
              .country-section {
                background: #ffffff;
                border-radius: 12px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                overflow: hidden;
                padding-bottom: 20px; /* Add some padding at the bottom of each section */
              }
              .country-header {
                background: linear-gradient(135deg, #34495e, #2c3e50);
                color: white;
                padding: 15px 20px;
                display: flex;
                align-items: center;
                gap: 15px;
                margin-bottom: 15px;
                font-weight: bold;
              }
              .flag-placeholder {
                width: 40px;
                height: 25px;
                background: #27ae60;
                border-radius: 4px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 16px;
              }
              .country-name {
                font-size: 20px;
                font-weight: bold;
                color: #fff;
              }
              .bank-list {
                padding: 0 20px;
              }
              .bank-row {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 10px 0;
                border-bottom: 1px solid #e9ecef;
                transition: background-color 0.2s;
              }
              .bank-row:hover {
                background-color: #f8f9fa;
              }
              .bank-row:last-child {
                border-bottom: none;
              }
              .bank-info {
                display: flex;
                align-items: center;
                gap: 8px;
              }
              .bank-logo-placeholder {
                width: 30px;
                height: 20px;
                background: #6c757d;
                border-radius: 4px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: #fff;
                font-size: 8px;
                font-weight: bold;
              }
              .bank-name {
                font-weight: bold;
                color: #111;
              }
              .rate {
                color: #111;
                font-weight: bold;
                font-size: 18px;
                background: #ffe5e5;
                padding: 4px 16px;
                border-radius: 20px;
                border: 2px solid #111;
              }
              .mexico-section {
                grid-row: span 2;
              }
              @media print {
                body { background: white !important; }
                .container { box-shadow: none; padding: 0 !important; }
                .header, .date-title { margin-bottom: 15px; }
                .bank-row:hover { background-color: transparent !important; }
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <div class="logo-placeholder">LOGO</div>
                <div class="company-name">${
                  logoType === "intermex" ? "INTERMEX" : "RIA"
                }</div>
              </div>
              
              <div class="date-title">
                <div class="date">${getCurrentDate()}</div>
                <div class="title">EXCHANGE RATES</div>
              </div>
              
              <div class="rates-container">
                <!-- Mexico Section (Left Column) -->
                <div class="country-section mexico-section">
                  <div class="country-header">
                    <div class="flag-placeholder"><img src="/flags/mexico.png"></div>
                    <div class="country-name">MEXICO (USD → MXN)</div>
                  </div>
                  <div class="bank-list">
                    ${countries.Mexico.banks
                      .map(
                        (bank) => `
                      <div class="bank-row">
                        <div class="bank-info">
                          <div class="bank-logo-placeholder">BANK</div>
                          <div class="bank-name">${bank}</div>
                        </div>
                        <div class="rate">${rates[bank]} MXN</div>
                      </div>
                    `
                      )
                      .join("")}
                  </div>
                </div>
                
                <!-- Honduras Section (Right Column Top) -->
                <div class="country-section">
                  <div class="country-header">
                    <div class="flag-placeholder"><img src="/flags/honduras.png"></div>
                    <div class="country-name">HONDURAS (USD → HNL)</div>
                  </div>
                  <div class="bank-list">
                    ${countries.Honduras.banks
                      .map(
                        (bank) => `
                      <div class="bank-row">
                        <div class="bank-info">
                          <div class="bank-logo-placeholder">BANK</div>
                          <div class="bank-name">${bank}</div>
                        </div>
                        <div class="rate">${rates[bank]} HNL</div>
                      </div>
                    `
                      )
                      .join("")}
                  </div>
                </div>
                
                <!-- Guatemala Section (Right Column Bottom) -->
                <div class="country-section">
                  <div class="country-header">
                    <div class="flag-placeholder"><img src="/flags/guatemala.png"></div>
                    <div class="country-name">GUATEMALA (USD → GTQ)</div>
                  </div>
                  <div class="bank-list">
                    ${countries.Guatemala.banks
                      .map(
                        (bank) => `
                      <div class="bank-row">
                        <div class="bank-info">
                          <div class="bank-logo-placeholder">BANK</div>
                          <div class="bank-name">${bank}</div>
                        </div>
                        <div class="rate">${rates[bank]} GTQ</div>
                      </div>
                    `
                      )
                      .join("")}
                  </div>
                </div>
                
                <!-- Colombia Section (Right Column Top) -->
                <div class="country-section">
                  <div class="country-header">
                    <div class="flag-placeholder"><img src="/flags/colombia.png"></div>
                    <div class="country-name">COLOMBIA (USD → COP)</div>
                  </div>
                  <div class="bank-list">
                    ${countries.Colombia.banks
                      .map(
                        (bank) => `
                      <div class="bank-row">
                        <div class="bank-info">
                          <div class="bank-logo-placeholder">BANK</div>
                          <div class="bank-name">${bank}</div>
                        </div>
                        <div class="rate">${rates[bank]} COP</div>
                      </div>
                    `
                      )
                      .join("")}
                  </div>
                </div>
                
                <!-- Haiti Section (Right Column Bottom) -->
                <div class="country-section">
                  <div class="country-header">
                    <div class="flag-placeholder"><img src="/flags/haiti.png"></div>
                    <div class="country-name">HAITI (USD → HTG)</div>
                  </div>
                  <div class="bank-list">
                    ${countries.Haiti.banks
                      .map(
                        (bank) => `
                      <div class="bank-row">
                        <div class="bank-info">
                          <div class="bank-logo-placeholder">BANK</div>
                          <div class="bank-name">${bank}</div>
                        </div>
                        <div class="rate">${rates[bank]} HTG</div>
                      </div>
                    `
                      )
                      .join("")}
                  </div>
                </div>
              </div>
            </div>
            
            <script>
              window.onload = function() {
                setTimeout(() => {
                  window.print();
                  setTimeout(() => window.close(), 1000);
                }, 500);
              }
            </script>
          </body>
          </html>
        `);
        printWindow.document.close();
      } else {
        alert(
          "No se pudo abrir la ventana de impresión. Por favor, permita las ventanas emergentes (popups) en su navegador."
        );
      }
    }

    setIsGenerating(false);
  };

  const closePreview = () => {
    setShowPreview(false);
    setPreviewContent("");
    setPreviewType("");
  };

  const getJsonData = () => {
    const jsonData = {
      date: getCurrentDate(),
      logo: logoType,
      rates: {},
    };

    Object.entries(countries).forEach(([country, data]) => {
      jsonData.rates[country] = {
        currency: data.currency,
        banks: {},
      };

      data.banks.forEach((bank) => {
        if (rates[bank]) {
          jsonData.rates[country].banks[bank] = parseFloat(rates[bank]);
        }
      });
    });

    return JSON.stringify(jsonData, null, 2);
  };

  const handleAutopopulate = () => {
    const newRates = {};
    Object.entries(countries).forEach(([country, data]) => {
      data.banks.forEach((bank) => {
        // Generate a random-ish rate for testing
        let rate;
        if (data.currency === "MXN") {
          rate = (Math.random() * (17.5 - 16.0) + 16.0).toFixed(2);
        } else if (data.currency === "HNL") {
          rate = (Math.random() * (24.7 - 24.5) + 24.5).toFixed(2);
        } else if (data.currency === "GTQ") {
          rate = (Math.random() * (7.8 - 7.6) + 7.6).toFixed(2);
        } else if (data.currency === "COP") {
          rate = (Math.random() * (4000 - 3800) + 3800).toFixed(2);
        } else if (data.currency === "HTG") {
          rate = (Math.random() * (135 - 130) + 130).toFixed(2);
        } else {
          rate = (Math.random() * (100 - 10) + 10).toFixed(2); // Default for others
        }
        newRates[bank] = rate;
      });
    });
    setRates(newRates);
    setErrors({}); // Clear any existing errors
  };

  const handleCountryToggle = (country) => {
    setSelectedCountries((prev) => {
      if (prev.includes(country)) {
        return prev.filter((c) => c !== country);
      } else {
        return [...prev, country];
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-2">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-4 mb-4">
          <h1 className="text-5xl font-bold text-gray-800 mb-4 text-center">
            Tipos de Camibio
          </h1>

          {/* Country Selection */}
          <div className="mb-4 bg-blue-50 p-3 rounded-lg border-2 border-blue-200">
            <h3 className="text-md font-medium text-gray-700 mb-2 text-center">
              Países a Incluir:
            </h3>
            <div className="flex flex-wrap justify-center gap-2">
              {Object.entries(countries).map(([country, data]) => (
                <button
                  key={country}
                  onClick={() => handleCountryToggle(country)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md border transition-colors ${
                    selectedCountries.includes(country)
                      ? "bg-green-500 text-white border-green-500"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {data.flag} {country}
                </button>
              ))}
            </div>
            <p className="text-sm text-gray-500 text-center mt-2">
              {selectedCountries.length === 0
                ? "✅ Los países seleccionados mostrarán campos de entrada abajo"
                : "Por favor complete todos los campos para los países seleccionados con tasas válidas para habilitar la exportación"}
            </p>
          </div>

          {/* Logo Toggle */}
          <div className="mb-4 text-center">
            <label className="text-md font-medium text-gray-700 mr-3">
              Compañia:
            </label>
            <div className="inline-flex rounded-md shadow-sm">
              <button
                onClick={() => setLogoType("intermex")}
                className={`px-3 py-1.5 text-sm font-medium rounded-l-md border ${
                  logoType === "intermex"
                    ? "bg-green-500 text-white border-green-500"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                Intermex
              </button>
              <button
                onClick={() => setLogoType("ria")}
                className={`px-3 py-1.5 text-sm font-medium rounded-r-md border-t border-r border-b ${
                  logoType === "ria"
                    ? "bg-orange-500 text-white border-blue-500"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                RIA
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Form */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">
                Ingresar Tipos de Cambio
              </h2>

              {Object.entries(countries).map(([country, data]) => (
                <div key={country} className="mb-4">
                  <h3 className="text-xl font-medium text-gray-700 mb-2">
                    {country} (USD → {data.currency})
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
                    {data.banks.map((bank) => (
                      <div key={bank}>
                        <label className="block text-sm font-medium text-gray-600 mb-0.5">
                          {bank}
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={rates[bank]}
                          onChange={(e) =>
                            handleRateChange(bank, e.target.value)
                          }
                          className={`w-full px-2 py-1.5 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors[bank] ? "border-red-500" : "border-gray-300"
                          }`}
                        />
                        {errors[bank] && (
                          <p className="text-red-500 text-xs mt-0.5">
                            {errors[bank]}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* JSON Display */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">
                Formato JSON
              </h2>
              <div className="bg-gray-100 rounded-md p-3 h-96 overflow-auto">
                <pre className="text-sm text-gray-800 whitespace-pre-wrap">
                  {getJsonData()}
                </pre>
              </div>

              {/* Preview Buttons */}
              <div className="mt-4 bg-gray-100 rounded-lg shadow-inner p-4">
                <h3 className="text-md font-medium text-gray-700 mb-2 text-center">
                  Vista Previa de Plantillas
                </h3>
                <div className="flex justify-center space-x-3">
                  <button
                    onClick={() => generateTemplate("pdf", true)}
                    disabled={!allFieldsValid() || isGenerating}
                    className="px-4 py-1.5 bg-red-400 text-white rounded-md hover:bg-red-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    Vista Previa PDF
                  </button>
                  <button
                    onClick={() => generateTemplate("png", true)}
                    disabled={!allFieldsValid() || isGenerating}
                    className="px-4 py-1.5 bg-blue-400 text-white rounded-md hover:bg-blue-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    Vista Previa PNG
                  </button>
                </div>

                {/* Export Buttons */}
                <div className="mt-4">
                  <h3 className="text-md font-medium text-gray-700 mb-2 text-center">
                    Exportar Plantilla
                  </h3>
                  <div className="flex justify-center space-x-3">
                    <button
                      onClick={() => generateTemplate("pdf")}
                      disabled={!allFieldsValid() || isGenerating}
                      className="px-4 py-1.5 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      {isGenerating ? "Generando..." : "Exportar PDF"}
                    </button>
                    <button
                      onClick={() => generateTemplate("png")}
                      disabled={!allFieldsValid() || isGenerating}
                      className="px-4 py-1.5 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      {isGenerating ? "Generando..." : "Exportar PNG"}
                    </button>
                    <button
                      onClick={handleAutopopulate}
                      className="px-4 py-1.5 bg-purple-500 text-white rounded-md hover:bg-purple-600"
                    >
                      Autocompletar
                    </button>
                  </div>
                  {!allFieldsValid() && (
                    <p className="text-yellow-600 text-xs mt-1 text-center">
                      {selectedCountries.length === 0
                        ? "✅ Los países seleccionados mostrarán campos de entrada abajo"
                        : "Por favor complete todos los campos para los países seleccionados con tasas válidas para habilitar la exportación"}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50 p-2">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl h-5/6 flex flex-col">
            <div className="flex justify-between items-center p-3 border-b border-gray-200">
              <h2 className="text-lg font-semibold">
                Vista Previa de Plantilla
              </h2>
              <button
                onClick={closePreview}
                className="text-gray-500 hover:text-gray-800 text-2xl font-bold"
              >
                &times;
              </button>
            </div>
            <div className="flex-grow overflow-auto p-3">
              {previewType === "image" && (
                <img
                  src={previewContent}
                  alt="Vista Previa PNG"
                  className="max-w-full h-auto mx-auto"
                />
              )}
              {previewType === "html" && (
                <iframe
                  srcDoc={previewContent}
                  className="w-full h-full border-none"
                  title="Vista Previa PDF"
                ></iframe>
              )}
            </div>
            <div className="p-3 border-t border-gray-200 text-right">
              <button
                onClick={closePreview}
                className="px-4 py-1.5 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MainComponent;
