let qrcode = null;

// Handle logo preview
document.getElementById("logo").addEventListener("change", function (e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const logoPreview = document.getElementById("logoPreview");
            logoPreview.src = e.target.result;
            logoPreview.style.display = "block";
        };
        reader.readAsDataURL(file);
    }
});

// Handle style option selection
document.querySelectorAll(".style-option").forEach(option => {
    option.addEventListener("click", function () {
        // Remove selected class from siblings
        this.parentElement
            .querySelectorAll(".style-option")
            .forEach(sib => sib.classList.remove("selected"));
        // Add selected class to clicked option
        this.classList.add("selected");
    });
});

function generateQR() {
    const text = document.getElementById("text").value;
    if (!text) {
        alert("Please enter content for the QR code");
        return;
    }

    const size = parseInt(document.getElementById("size").value);
    const errorCorrection = document.getElementById("errorCorrection").value;
    const foreColor = document.getElementById("foreColor").value;
    const backColor = document.getElementById("backColor").value;
    const qrcodeDiv = document.getElementById("qrcode");

    // Get selected styles
    const dotStyle = document.querySelector("#dotStyles .selected").dataset
        .style;
    const cornerStyle = document.querySelector("#cornerStyles .selected")
        .dataset.style;

    // Clear previous QR code
    qrcodeDiv.innerHTML = "";

    // Generate new QR code
    qrcode = new QRCode(qrcodeDiv, {
        text: text,
        width: size,
        height: size,
        colorDark: foreColor,
        colorLight: backColor,
        correctLevel: QRCode.CorrectLevel[errorCorrection],
    });

    // Apply custom styles after a short delay
    setTimeout(() => {
        applyCustomStyles(dotStyle, cornerStyle);

        // Add logo if uploaded
        const logoInput = document.getElementById("logo");
        if (logoInput.files && logoInput.files[0]) {
            addLogo(logoInput.files[0]);
        }
    }, 100);
}

function applyCustomStyles(dotStyle, cornerStyle) {
    const canvas = document.querySelector("#qrcode canvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const size = canvas.width;
    const cellSize = size / 25; // QR code is typically 25x25 cells

    // Clear canvas
    ctx.clearRect(0, 0, size, size);
    ctx.fillStyle = document.getElementById("backColor").value;
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = document.getElementById("foreColor").value;

    // Helper function to check if a pixel is dark
    function isPixelDark(x, y) {
        const idx = (y * size + x) * 4;
        return data[idx] === 0;
    }

    // Draw custom styled dots
    for (let y = 0; y < size; y += cellSize) {
        for (let x = 0; x < size; x += cellSize) {
            if (isPixelDark(x + cellSize / 2, y + cellSize / 2)) {
                const centerX = x + cellSize / 2;
                const centerY = y + cellSize / 2;
                const radius = (cellSize / 2) * 0.9;

                ctx.beginPath();

                if (dotStyle === "rounded") {
                    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
                } else if (dotStyle === "dots") {
                    ctx.arc(centerX, centerY, radius * 0.8, 0, Math.PI * 2);
                } else {
                    // square
                    ctx.rect(
                        x + cellSize * 0.1,
                        y + cellSize * 0.1,
                        cellSize * 0.8,
                        cellSize * 0.8
                    );
                }

                ctx.fill();
            }
        }
    }

    // Draw custom corner patterns
    const cornerSize = cellSize * 7;
    const cornerLocations = [
        [0, 0], // Top-left
        [size - cornerSize, 0], // Top-right
        [0, size - cornerSize], // Bottom-left
    ];

    cornerLocations.forEach(([x, y]) => {
        ctx.save();
        ctx.translate(x, y);

        if (cornerStyle === "rounded") {
            drawRoundedCorner(cornerSize);
        } else if (cornerStyle === "extra-rounded") {
            drawExtraRoundedCorner(cornerSize);
        } else {
            drawSquareCorner(cornerSize);
        }

        ctx.restore();
    });
}

function drawSquareCorner(size) {
    const ctx = document.querySelector("#qrcode canvas").getContext("2d");
    ctx.fillRect(0, 0, size, size);
    ctx.clearRect(size * 0.2, size * 0.2, size * 0.6, size * 0.6);
    ctx.fillRect(size * 0.3, size * 0.3, size * 0.4, size * 0.4);
}

function drawRoundedCorner(size) {
    const ctx = document.querySelector("#qrcode canvas").getContext("2d");
    const radius = size / 2;

    // Outer rounded square
    ctx.beginPath();
    ctx.arc(size * 0.5, size * 0.5, radius * 0.95, 0, Math.PI * 2);
    ctx.fill();

    // Inner clearing
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(size * 0.5, size * 0.5, radius * 0.6, 0, Math.PI * 2);
    ctx.fill();

    // Inner dot
    ctx.globalCompositeOperation = "source-over";
    ctx.beginPath();
    ctx.arc(size * 0.5, size * 0.5, radius * 0.35, 0, Math.PI * 2);
    ctx.fill();
}

function drawExtraRoundedCorner(size) {
    const ctx = document.querySelector("#qrcode canvas").getContext("2d");
    const radius = size / 2;

    // Outer circle
    ctx.beginPath();
    ctx.arc(size * 0.5, size * 0.5, radius * 0.9, 0, Math.PI * 2);
    ctx.fill();

    // Inner clearing
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(size * 0.5, size * 0.5, radius * 0.65, 0, Math.PI * 2);
    ctx.fill();

    // Inner circle
    ctx.globalCompositeOperation = "source-over";
    ctx.beginPath();
    ctx.arc(size * 0.5, size * 0.5, radius * 0.4, 0, Math.PI * 2);
    ctx.fill();
}

function addLogo(logoFile) {
    const reader = new FileReader();
    reader.onload = function (e) {
        const logo = new Image();
        logo.src = e.target.result;
        logo.onload = function () {
            const canvas = document.querySelector("#qrcode canvas");
            const ctx = canvas.getContext("2d");

            // Calculate logo size (25% of QR code size)
            const logoSize = canvas.width * 0.25;
            const logoX = (canvas.width - logoSize) / 2;
            const logoY = (canvas.height - logoSize) / 2;

            // Create circular clipping path for logo
            ctx.save();
            ctx.beginPath();
            ctx.arc(
                logoX + logoSize / 2,
                logoY + logoSize / 2,
                logoSize / 2,
                0,
                Math.PI * 2
            );
            ctx.clip();

            // Draw logo
            ctx.drawImage(logo, logoX, logoY, logoSize, logoSize);
            ctx.restore();

            // Draw white border around logo
            ctx.beginPath();
            ctx.arc(
                logoX + logoSize / 2,
                logoY + logoSize / 2,
                logoSize / 2 + 2,
                0,
                Math.PI * 2
            );
            ctx.strokeStyle = "white";
            ctx.lineWidth = 4;
            ctx.stroke();
        };
    };
    reader.readAsDataURL(logoFile);
}

function downloadQR(format) {
    const canvas = document.querySelector("#qrcode canvas");
    if (!canvas) {
        alert("Please generate a QR code first");
        return;
    }

    if (format === "png") {
        const link = document.createElement("a");
        link.download = "qrcode.png";
        link.href = canvas.toDataURL("image/png");
        link.click();
    } else if (format === "svg") {
        // Convert canvas to SVG
        const svg = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "svg"
        );
        const size = canvas.width;
        svg.setAttribute("width", size);
        svg.setAttribute("height", size);
        svg.setAttribute("viewBox", `0 0 ${size} ${size}`);

        const img = document.createElement("img");
        img.src = canvas.toDataURL("image/png");

        const svgImg = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "image"
        );
        svgImg.setAttributeNS(null, "width", size);
        svgImg.setAttributeNS(null, "height", size);
        svgImg.setAttributeNS("http://www.w3.org/1999/xlink", "href", img.src);
        svg.appendChild(svgImg);

        const svgData = new XMLSerializer().serializeToString(svg);
        const svgBlob = new Blob([svgData], {
            type: "image/svg+xml;charset=utf-8",
        });
        const svgUrl = URL.createObjectURL(svgBlob);

        const link = document.createElement("a");
        link.download = "qrcode.svg";
        link.href = svgUrl;
        link.click();

        URL.revokeObjectURL(svgUrl);
    }
}

function resetForm() {
    // Reset all inputs to default values
    document.getElementById("text").value = "";
    document.getElementById("size").value = "200";
    document.getElementById("errorCorrection").value = "H";
    document.getElementById("foreColor").value = "#000000";
    document.getElementById("backColor").value = "#FFFFFF";
    document.getElementById("logo").value = "";
    document.getElementById("logoPreview").style.display = "none";

    // Reset style selections
    document.querySelectorAll(".style-options").forEach(group => {
        group.querySelectorAll(".style-option").forEach(option => {
            option.classList.remove("selected");
        });
        group.querySelector('[data-style="square"]').classList.add("selected");
    });

    // Clear QR code
    document.getElementById("qrcode").innerHTML = "";
}
