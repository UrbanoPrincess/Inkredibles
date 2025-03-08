<script lang="ts">
  import { Toast } from 'flowbite-svelte';
  import { CheckCircleSolid } from 'flowbite-svelte-icons';
  import { getFirestore, collection, addDoc, updateDoc, getDocs } from 'firebase/firestore';
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
  let category = "";
  let file: File | null = null;
  let base64Image = "";
  let images: any[] = [];

  // Modal and Toast visibility
  let formModalOpen = false;
  let showToast = false;

  // Fetch templates from Firestore
  async function fetchTemplates() {
      try {
          const querySnapshot = await getDocs(collection(db, "templates"));
          images = querySnapshot.docs.map(doc => ({ templateId: doc.id, ...doc.data() }));
      } catch (error) {
          console.error("Error fetching templates:", error);
      }
  }

  fetchTemplates();

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
          if (!file || !base64Image || !category.trim()) {
              alert("Please fill in all fields.");
              return;
          }

          const user = auth.currentUser;
          const newTemplate = {
              title,
              description,
              category,
              imageBase64: base64Image,
              createdAt: new Date(),
              uploadedBy: user ? user.email || "Unknown" : "Anonymous"
          };

          const docRef = await addDoc(collection(db, "templates"), newTemplate);
          await updateDoc(docRef, { templateId: docRef.id });

          clearForm();
          formModalOpen = false;
          showToast = true;
          fetchTemplates(); // Refresh the image gallery
          setTimeout(() => (showToast = false), 3000);
      } catch (error) {
          console.error("Error adding template:", error);
          alert("Failed to add template. Please try again.");
      }
  }

  // Clear form function
  function clearForm() {
      title = "";
      description = "";
      category = "";
      file = null;
      base64Image = "";
  }
</script>

<main class="container mx-auto px-4 sm:px-6 lg:px-8 min-h-screen py-6">
  <div class="text-right mb-4">
      <Button on:click={() => formModalOpen = true} class="bg-blue-500 text-white">Upload Template</Button>
  </div>

  <!-- Image Gallery -->
  <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {#each images as image (image.templateId)}
          <div class="bg-white rounded-lg shadow-lg p-4">
              <img src={image.imageBase64} alt={image.title} class="w-full h-auto rounded-lg" />
              <h3 class="mt-2 font-semibold">{image.title}</h3>
              <p class="text-gray-600">{image.category}</p>
          </div>
      {/each}
  </div>

  <Modal open={formModalOpen} on:close={() => formModalOpen = false}>
      <div class="p-6">
          <h2 class="text-xl font-semibold mb-4">Upload Template</h2>
          <Label for="title">Title</Label>
          <Input id="title" bind:value={title} class="mb-4" />
          <Label for="description">Description</Label>
          <Input id="description" bind:value={description} class="mb-4" />
          <Label for="category">Category</Label>
          <Input id="category" bind:value={category} class="mb-4" placeholder="Type category here..." />
          <Label for="file">Choose Image</Label>
          <Input id="file" type="file" accept="image/*" on:change={handleFileChange} class="mb-4" />
          {#if base64Image}
              <img src={base64Image} alt="Preview" class="w-full h-auto rounded-lg mb-4" />
          {/if}
          <Button on:click={addTemplate} class="w-full bg-blue-500 text-white">Upload</Button>
      </div>
  </Modal>

  {#if showToast}
      <Toast on:click={() => showToast = false} class="mt-4">
          <CheckCircleSolid class="w-6 h-6 text-green-500" />
          Template uploaded successfully!
      </Toast>
  {/if}
</main>
