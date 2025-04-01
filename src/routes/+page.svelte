<script>
// @ts-nocheck

    import { goto } from "$app/navigation";
    import { getFirestore, collection, getDocs } from 'firebase/firestore';
    import { firebaseConfig } from "$lib/firebaseConfig";
    import { initializeApp, getApps, getApp } from "firebase/app";
    import { getAuth } from 'firebase/auth';
    import { writable } from "svelte/store";
    import { onMount } from "svelte";
    import EditorModal from '$lib/components/Editor.svelte';

    // Firebase initialization
    const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    const db = getFirestore(app);
    const auth = getAuth(app);
    

    // Store for templates
    const images = writable([]);
    let loading = true;

  let showEditor = false;
  let selectedImage = null;

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

  function openEditor(image) {
    selectedImage = image;
    showEditor = true;
  }

  function closeEditor() {
    showEditor = false;
    selectedImage = null;
  }

  onMount(fetchTemplates);
</script>

<style>
    /* Theme Colors */
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
    border: 2px solid rgba(0, 0, 0, 0.1); /* Soft border */
    box-shadow: 10px 10px 20px rgba(0, 0, 0, 0.15), 
                -5px -5px 15px rgba(255, 255, 255, 0.5); /* Floating effect */
    padding: 15px;
    text-align: center;
    overflow: hidden;
    background: white; /* Keeps it clean */
    transition: transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out; /* Smooth animation */
}

.template-card img {
    width: 100%;
    height: 250px; /* Ensures uniform height */
    object-fit: contain; /* Prevents stretching or cropping */
    background: white; /* Ensures a white background */
    border-radius: 10px;
    padding: 10px;
}


    /* Responsive Styles */
    @media (max-width: 500px) {
        header {
            flex-direction: column;
            align-items: flex-start;
        }
    }
</style>
<main>
    <header>
      <h1 class="logo">
        <img src="/images/logo.png" alt="Inkredibles Logo">
      </h1>
      <nav class="navbar">
        <a class="tab" href="./" aria-label="home">Home</a>
        <a class="tab" href="./about" aria-label="about">About Us</a>
        <a class="tab" href="./services" aria-label="services">Services</a>
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
          <button class="template-card" on:click={() => openEditor(image)} aria-label={`Open editor for ${image.title}`}>
            <img src={image.imageBase64} alt={image.title} />
            <h3>{image.title}</h3>
            <p>{image.category}</p>
          </button>
        {/each}
      </div>
    {/if}
  
    <!-- Editor Modal -->
    {#if showEditor}
      <EditorModal showModal={showEditor} closeModal={closeEditor} image={selectedImage} />
    {/if}
  </main>
