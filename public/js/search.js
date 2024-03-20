document.getElementById('vidSearch')
    .addEventListener('keyup', e => {
        e.preventDefault()
        if (e.key === 'Enter') {
            document.getElementById("searchButton").click()
        }
    })

document.getElementById('searchButton').addEventListener('click', function(event) {
    const query = document.getElementById('vidSearch').value.trim();

    fetch('/search/videos?search=' + encodeURIComponent(query))
    .then(response => response.json())
    .then(data => {
        displaySearchResults(data);
    })
    .catch(error => {
        console.error('Error:', error);
    });
});

function displaySearchResults(results) {
    // Clear previous search results
    document.getElementById('searchResults').innerHTML = '';
    
    // Display new search results
    results.forEach(result => {
        const resultElement = document.createElement('div');
        resultElement.textContent = result.title;

        const resultImg = document.createElement('img');
        resultImg.src = result.thumbnail_name;

        const resultLink = document.createElement('a');
        resultLink.href = result.video_url;
        resultLink.target = "_blank";
        
        resultLink.appendChild(resultImg)
        resultElement.append(resultLink)
        
        
        document.getElementById('searchResults').appendChild(resultElement);
    });
}