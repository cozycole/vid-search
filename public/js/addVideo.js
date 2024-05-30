function previewImage(event) {
    const file = event.target.files[0];

    if (file) {
        const reader = new FileReader();

        reader.onload = function(e) {
            const imagePreview = document.getElementById('imagePreview');
            imagePreview.innerHTML = ''; // Clear previous image previews

            const img = document.createElement('img');
            img.src = e.target.result;
            img.style.maxWidth = '300px'; // Limit image width for display
            imagePreview.appendChild(img);
        };

        reader.readAsDataURL(file);
    }
}

// document.getElementById('addVideoForm').addEventListener('submit', function(event) {
//     event.preventDefault(); // Prevent form submission

//     // Add your form submission logic here
//     // For example, you can use AJAX to submit the form data to the server
//     // Alternatively, you can append the image file to a FormData object and send it via fetch or XMLHttpRequest
// });