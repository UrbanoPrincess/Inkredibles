<script>
  // @ts-nocheck

  import { goto } from "$app/navigation";
  import { getFirestore, collection, getDocs } from 'firebase/firestore';
  import { firebaseConfig } from "$lib/firebaseConfig";
  import { initializeApp, getApps, getApp } from "firebase/app";
  import { getAuth } from 'firebase/auth';
  import { writable } from "svelte/store";
  import { onMount } from "svelte";
 
  // Firebase initialization
  const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  const db = getFirestore(app);
  const auth = getAuth(app);
  const images = writable([]);
  let loading = true;

  let showEnlarged = false; 
  let enlargedImage = null; 

  // Fetch templates from Firestore
  async function fetchTemplates() {
      try {
          const querySnapshot = await getDocs(collection(db, "templates"));
          images.set(querySnapshot.docs.map(doc => ({ templateId: doc.id, ...doc.data() })));
      } catch (error) {
          console.error("Error fetching templates:", error);
      } finally {
          loading = false;
      }
  }

  function openEnlargedView(image) {
      enlargedImage = image; 
      showEnlarged = true;   
  }

  function closeEnlargedView() {
      showEnlarged = false;
      enlargedImage = null; 
  }

  onMount(fetchTemplates);
</script>

<style>
    :root {
        --primary-red: #830000;
        --accent-yellow: #fddb22;
        --text-white: #fff;
        --text-dark: #333;
    }

    /* Hero Section */
    .hero-section {
        background: var(--primary-red);
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
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
        color: var(--text-white);
        padding: 20px;
    }

    /* Header */
    header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: var(--accent-yellow);
        padding: 15px;
        flex-wrap: wrap;
        font-family: 'Newsreader', serif;
    }

    .logo img {
        height: 50px;
    }

    /* Navbar */
    .navbar {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 20px;
    }

    .tab {
        color: var(--primary-red);
        font-weight: bold;
        text-decoration: none;
        padding: 8px 12px;
        border-radius: 5px;
        transition: background-color 0.3s;
    }

    .tab:hover {
        background-color: rgba(0, 0, 0, 0.1);
    }

    /* Login Button */
    .login-button {
        background-color: var(--primary-red);
        color: var(--text-white);
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
        transition: background-color 0.3s, box-shadow 0.3s;
        box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.2);
    }

    .login-button:hover {
        background-color: #a50000;
        box-shadow: 3px 3px 7px rgba(0, 0, 0, 0.3);
    }

    /* Image Grid */
    .grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 20px;
        padding: 20px;
    }

    .template-card {
        border-radius: 10px;
        border: 2px solid rgba(0, 0, 0, 0.1); 
        box-shadow: 10px 10px 20px rgba(0, 0, 0, 0.15),
                    -5px -5px 15px rgba(255, 255, 255, 0.5); 
        padding: 15px;
        text-align: center;
        overflow: hidden;
        background: white; 
        transition: transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out;
        cursor: pointer;
        appearance: none;
        -webkit-appearance: none;
        text-align: center;
        font: inherit;
    }

    .template-card img {
        width: 100%;
        height: 250px;
        object-fit: contain;
        background: white;
        border-radius: 10px;
        padding: 10px;
        display: block; 
        margin: 0 auto 10px auto; 
    }

    @media (max-width: 500px) {
        header {
            flex-direction: column;
            align-items: flex-start;
        }
    }
    .enlarged-view-backdrop {
        position: fixed; 
        z-index: 1000; 
        left: 0;
        top: 0;
        width: 100%;
        height: 100%; 
        overflow: auto; 
        background-color: rgba(0, 0, 0, 0.8); 
        display: flex; 
        justify-content: center;
        align-items: center;
        padding: 20px; 
        cursor: pointer; 
    }

    .enlarged-view-content {
        background-color: #fefefe;
        margin: auto;
        padding: 20px;
        border-radius: 10px;
        max-width: 90%; 
        max-height: 90vh; 
        display: flex; 
        flex-direction: column; 
        align-items: center;
        cursor: default; 
        box-shadow: 0 4px 8px 0 rgba(0,0,0,0.2), 0 6px 20px 0 rgba(0,0,0,0.19);
        animation: fadeIn 0.3s; 
    }

    .enlarged-view-content img {
        display: block;
        max-width: 100%; 
        max-height: calc(90vh - 60px); 
        height: auto; 
        object-fit: contain; 
    }

    
    

   
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
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
        The Inkredibles – Upload. Filter. Transform. <br />
        Because every picture deserves to be unforgettable, fun, and uniquely YOU!
      </h1>
    </div>

    <!-- Image Gallery -->
    {#if loading}
      <p style="text-align: center; font-size: 18px;">Loading templates...</p>
    {:else}
      <div class="grid">
        {#each $images as image (image.templateId)}
     
          <button
            type="button" class="template-card"
            on:click={() => openEnlargedView(image)}
            aria-label={`View enlarged ${image.title} template`}
           >
            <img src={image.imageBase64} alt={image.title} />
            <h3>{image.title}</h3>
            <p>{image.category}</p>
          </button>
        {/each}
      </div>
    {/if}

    {#if showEnlarged && enlargedImage}
    
      <button class="enlarged-view-backdrop" on:click={closeEnlargedView} role="dialog" aria-modal="true" aria-labelledby="enlarged-title" type="button">
        <div class="enlarged-view-content" on:click|stopPropagation>
          <img src={enlargedImage.imageBase64} alt={`Enlarged view of ${enlargedImage.title}`} />
          <h3 id="enlarged-title" style="margin-top: 10px; color: var(--text-dark);">{enlargedImage.title}</h3>
        </div>
      </button>
    {/if}

</main>