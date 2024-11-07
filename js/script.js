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

function generateQR() {
    const text = document.getElementById("text").value;
    const size = parseInt(document.getElementById("size").value);
    const errorCorrection = document.getElementById("errorCorrection").value;
    const foreColor = document.getElementById("foreColor").value;
    const backColor = document.getElementById("backColor").value;
    const qrcodeDiv = document.getElementById("qrcode");

    // Validate input
    if (!text) {
        alert("Please enter text or URL");
        return;
    }

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

    // Add logo if uploaded
    const logoInput = document.getElementById("logo");
    if (logoInput.files && logoInput.files[0]) {
        setTimeout(() => {
            addLogo(logoInput.files[0]);
        }, 100);
    }
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

            // Draw logo
            ctx.drawImage(logo, logoX, logoY, logoSize, logoSize);
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
    document.getElementById("text").value = "";
    document.getElementById("size").value = "200";
    document.getElementById("errorCorrection").value = "H";
    document.getElementById("foreColor").value = "#000000";
    document.getElementById("backColor").value = "#FFFFFF";
    document.getElementById("logo").value = "";
    document.getElementById("logoPreview").style.display = "none";
    document.getElementById("qrcode").innerHTML = "";
}
