<script lang="ts">
    import { Toast } from 'flowbite-svelte';
    import { CheckCircleSolid } from 'flowbite-svelte-icons';
    import { getFirestore, collection, addDoc, updateDoc } from 'firebase/firestore';
    import { firebaseConfig } from "$lib/firebaseConfig";
    import { initializeApp, getApps, getApp } from "firebase/app";
    import { getAuth } from 'firebase/auth';
    import { Modal, Input, Label, Button } from 'flowbite-svelte';
  
    // Firebase initialization
    const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    const db = getFirestore(app);
    const auth = getAuth(app);
  
    // Form variables
    let title = "";
    let description = "";
    let file: File | null = null;
    let base64Image = "";
  
    // Modal and Toast visibility
    let formModalOpen = true;
    let showToast = false;
  
    // Convert image to Base64
    function convertToBase64(file: File) {
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
      });
    }
  
    // Handle file selection
    async function handleFileChange(event: Event) {
      const target = event.target as HTMLInputElement;
      if (target.files && target.files.length > 0) {
        file = target.files[0];
  
        // Convert image to Base64
        try {
          base64Image = await convertToBase64(file);
        } catch (error) {
          console.error("Error converting image:", error);
          alert("Failed to process image. Please try again.");
        }
      }
    }
  
    // Add template function
    async function addTemplate() {
      try {
        if (!file || !base64Image) {
          alert("Please select an image.");
          return;
        }
  
        const user = auth.currentUser;
        const newTemplate = {
          title,
          description,
          imageBase64: base64Image, // Store as Base64
          createdAt: new Date(),
          uploadedBy: user ? user.email || "Unknown" : "Anonymous"
        };
  
        // Add document to Firestore
        const docRef = await addDoc(collection(db, "templates"), newTemplate);
        await updateDoc(docRef, { templateId: docRef.id });
  
        clearForm();
        formModalOpen = false;
        showToast = true; // Show Toast
        setTimeout(() => (showToast = false), 3000); // Hide Toast after 3 seconds
      } catch (error) {
        console.error("Error adding template:", error);
        alert("Failed to add template. Please try again.");
      }
    }
  
    // Clear form function
    function clearForm() {
      title = "";
      description = "";
      file = null;
      base64Image = "";
    }
  </script>
  
  <main>
    <div class="container mx-auto px-4 sm:px-6 lg:px-8 min-h-screen py-6">
      <div class="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
        <h2 class="text-xl font-semibold mb-4">Upload Template</h2>
  
        <Label for="title">Title</Label>
        <Input id="title" bind:value={title} class="mb-4" />
  
        <Label for="description">Description</Label>
        <Input id="description" bind:value={description} class="mb-4" />
  
        <Label for="file">Choose Image</Label>
        <Input id="file" type="file" accept="image/*" on:change={handleFileChange} class="mb-4" />
  
        {#if base64Image}
          <img src={base64Image} alt="Preview" class="w-full h-auto rounded-lg mb-4" />
        {/if}
  
        <Button on:click={addTemplate} class="w-full bg-blue-500 text-white">Upload</Button>
  
        {#if showToast}
          <Toast on:click={() => showToast = false} class="mt-4">
            <CheckCircleSolid class="w-6 h-6 text-green-500" />
            Image uploaded successfully!
          </Toast>
        {/if}
      </div>
    </div>
  </main>
  