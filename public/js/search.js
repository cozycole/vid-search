// Make it so enter button clicks button
document.getElementById('searchInput')
    .addEventListener('keyup', e => {
        e.preventDefault()
        if (e.key === 'Enter') {
            document.getElementById("searchButton").click()
        }
    })

// API call to search videos on button click
document.getElementById('searchButton').addEventListener('click', function(event) {
    const query = document.getElementById('searchInput').value.trim();

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
    console.log(results)
    
    // Display new search results
    results.forEach(result => {
        const resultElement = document.createElement('div');
        resultElement.className = 'videoResult'


        const resultTitle = document.createElement('h2');
        resultTitle.textContent = result.title;

        const resultImg = document.createElement('img');
        resultImg.src = result.thumbnail_name;
        resultImg.className = 'videoThumbnail'

        const resultLink = document.createElement('a');
        resultLink.href = result.video_url;
        resultLink.target = '_blank';
        
        const creatorName = document.createElement('h3');
        creatorName.textContent = result.creator_name;
        
        const creatorImage = document.createElement('img');
        creatorImage.src = result.creator_img_path;
        
        const vidMetaData = document.createElement('div');
        vidMetaData.className = 'vidMetaData';
        
        // Data below the thumbnail that has the video's
        // title and channel name which are both next
        // to the creator's profile image
        vidMetaData.appendChild(resultTitle);
        vidMetaData.appendChild(creatorName);

        const videoDetails = document.createElement('div');
        videoDetails.className = 'videoDetails'
        videoDetails.append(creatorImage);
        videoDetails.append(vidMetaData);
        
        resultLink.appendChild(resultImg);

        resultElement.append(resultLink);
        resultElement.append(videoDetails);

        document.getElementById('searchResults').appendChild(resultElement);
    });
}