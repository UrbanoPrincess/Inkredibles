<style>
    .hero-section {
        background-image: url('/images/bg.png'); /* Background Image */
        background-size: cover; /* Ensures the background covers the section */
        background-position: top left; 
        background-repeat: no-repeat;
        
        display: flex;
        justify-content: flex-start; /* Aligns text to the left horizontally */
        align-items: center; /* Centers text vertically */
        text-align: left; /* Aligns text to the left */
        padding: 20px;
        
        height: 40vh; /* Adjust height based on viewport height (more height on larger screens) */
        min-height: 150px; /* Minimum height based on your Figma design */
        width: 100%; /* Full width to ensure responsiveness */
    }
    
    .hero-text {
        font-size: clamp(16px, 4vw, 24px); /* Responsive text: Adjusts size depending on viewport width */
        font-weight: bold;
        font-family: 'Newsreader', serif;
        max-width: 80%; /* Keeps the text within 80% of the width */
        line-height: 1.5;
        text-shadow: 2px 2px 5px rgba(0, 0, 0, 0.5);
        color: rgb(0, 0, 0);
        padding: 20px; /* Padding to keep text away from the edges */
    }
    </style>
    
    <div class="hero-section">
        <h1 class="hero-text">The Inkredibles – Upload. Filter. Transform. <br>
            Because every picture deserves to be unforgettable, fun, and uniquely YOU!</h1>
    </div>
    