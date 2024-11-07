const generateBtn = document.getElementById('generateBtn');
let qrcode = null;

const generateQR = () => {
    const text = document.getElementById('text').value;
    const size = parseInt(document.getElementById('size').value);
    const qrcodeDiv = document.getElementById('qrcode');
    const donwloadLink = document.getElementById('download');

    qrcodeDiv.innerHTML = '';

    if(!text) {
        alert('Please enter a text or URL');
        return;
    }

    qrcode = new QRCode(qrcodeDiv, {
        text: text,
        width: size,
        height: size,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
    });

    setTimeout(() => {
        const qrImage = qrcodeDiv.querySelector('img');
        donwloadLink.href = qrImage.src;
        donwloadLink.style.display = 'block';
    },100)
}

generateBtn.addEventListener('click', generateQR);