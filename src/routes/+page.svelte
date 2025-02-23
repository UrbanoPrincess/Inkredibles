<script>

  import { goto } from "$app/navigation";

</script>
<style>
    .hero-section {
        background-image: url('/images/bg.png'); 
        background-size: cover;
        background-position: top left;
        background-repeat: no-repeat;

        display: flex;
        justify-content: flex-start; 
        align-items: center; 
        text-align: left; 
        padding: 20px;

        height: 40vh; 
        min-height: 150px; 
        width: 100%; 
    }

    .hero-text {
        font-size: clamp(16px, 4vw, 24px); 
        font-weight: bold;
        font-family: 'Newsreader', serif;
        max-width: 80%; 
        line-height: 1.5;
        text-shadow: 2px 2px 5px rgba(0, 0, 0, 0.5);
        color: rgb(0, 0, 0);
        padding: 20px; 
    }

    header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: linear-gradient(19deg, #FFFEFE 0%, #D1D1D1 100%);
        padding: 15px;
        flex-wrap: wrap;
        font-family: 'Newsreader', serif;
    }

    .logo img {
        height: 50px;
        margin-right: 10px;
    }

    main {
        margin-bottom: 60px;
        font-family: 'Newsreader', serif;
    }

    @media (max-width: 500px) {
        header {
            flex-direction: column;
            align-items: flex-start;
        }
    }

    .login-button {
        background-color: #EDEDED; 
        color: #333; 
        border: none;
        padding: 8px 12px;
        border-radius: 5px;
        cursor: pointer;
        display: flex;
        align-items: center;
        font-size: 14px;
        font-family: 'Newsreader', serif;
        font-weight: bold;
        white-space: nowrap;
        transition: background-color 0.3s ease, box-shadow 0.3s ease;
        box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.2); 
    }

    .login-button:hover {
        background-color: #D6D6D6; 
        box-shadow: 3px 3px 7px rgba(0, 0, 0, 0.3); 
    }

    .navbar {
        display: flex;
        justify-content: center; 
        align-items: center;
        gap: 20px; 
        padding: 10px 0;
    }
</style>

<main>
    <header>
        <h1 class="logo">
            <img src="/images/logo.png" alt="Inkredibles Logo">
        </h1>

        <nav class="navbar">
            <a class="tab" href="./" aria-label="home">Home</a>
            <a class="tab" href="./" aria-label="about">About Us</a>
            <a class="tab" href="./" aria-label="services">Services</a>
            
        </nav>

        <button class="login-button" aria-label="login" on:click={() => goto('./login')}>Login</button>
    </header>

    <div class="hero-section">
        <h1 class="hero-text">
            The Inkredibles – Upload. Filter. Transform. <br>
            Because every picture deserves to be unforgettable, fun, and uniquely YOU!
        </h1>
    </div>
</main>
