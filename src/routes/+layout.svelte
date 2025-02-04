<script>
    // @ts-nocheck
    import '../app.css';
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    

    onMount(() => {
        goto('./'); 
    });
</script>

<style>
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
    height: 50px; /* Adjust the size */
    margin-right: 10px; /* Add space between the logo and text */
    
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
    background-color: #EDEDED; /* Light gray background */
    color: #333; /* Dark text for contrast */
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
    box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.2); /* Soft shadow */
}

.login-button:hover {
    background-color: #D6D6D6; /* Slightly darker gray on hover */
    box-shadow: 3px 3px 7px rgba(0, 0, 0, 0.3); /* More pronounced shadow on hover */
}

.navbar {
    display: flex;
    justify-content: center; /* Centers horizontally */
    align-items: center; /* Aligns vertically */
    gap: 20px; /* Adds spacing between links */
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
                <a class="tab" href="./" aria-label="pricing">Pricing</a>
            </nav>
            
            <button class="login-button" aria-label="login" on:click={() => goto('./loginAdmin')}>Login</button>

       
    </header>
    
    <slot />
</main>
