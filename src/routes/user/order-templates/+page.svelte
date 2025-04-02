<script lang="ts">
    import { Toast } from 'flowbite-svelte';
    import { CheckCircleSolid } from 'flowbite-svelte-icons';
    import { getFirestore, collection, getDocs, addDoc } from 'firebase/firestore';
    import { firebaseConfig } from "$lib/firebaseConfig";
    import { initializeApp, getApps, getApp } from "firebase/app";
    import { getAuth } from 'firebase/auth';
    import { Modal, Button } from 'flowbite-svelte'; // Make sure Button is imported
    import EditorModal from '$lib/components/Editor.svelte';

    // Firebase initialization
    const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    const db = getFirestore(app);
    const auth = getAuth(app);

    // Template data
    let templates: any[] = [];
    let selectedTemplate: any = null;
    let orderModalOpen = false;
    let showToast = false;

    // Editor modal state
    let showEditor = false;
    let selectedImage: any = null;

    // Fetch templates from Firestore
    async function fetchTemplates() {
        try {
            const querySnapshot = await getDocs(collection(db, "templates"));
            templates = querySnapshot.docs.map(doc => ({ templateId: doc.id, ...doc.data() }));
        } catch (error) {
            console.error("Error fetching templates:", error);
        }
    }

    fetchTemplates();

    // Handle order submission
    async function placeOrder() {
        if (!selectedTemplate) {
            alert("Please select a template to order.");
            return;
        }

        try {
            const user = auth.currentUser;
            const orderData = {
                templateId: selectedTemplate.templateId,
                userEmail: user ? user.email : "Anonymous",
                orderedAt: new Date(),
                // Add other relevant order details if needed
                templateTitle: selectedTemplate.title, // Good practice to store title too
            };

            await addDoc(collection(db, "orders"), orderData);
            showToast = true;
            orderModalOpen = false;
            // Optional: Clear selected template after order
            // selectedTemplate = null;
            setTimeout(() => (showToast = false), 3000);
        } catch (error) {
            console.error("Error placing order:", error);
            alert("Failed to place order. Please try again.");
        }
    }

    // Add to cart function
    function addToCart(template: any) {
        try {
            const storedCart = localStorage.getItem('cart');
            const cart = storedCart ? JSON.parse(storedCart) : [];

            // Check if item already in cart (optional, prevents duplicates)
            const exists = cart.some((item: any) => item.templateId === template.templateId);
            if (exists) {
                 alert(`${template.title} is already in your cart.`);
                 return;
            }

            // Add the new template to the cart
            // Consider adding quantity or other relevant details if needed later
            cart.push({
                templateId: template.templateId,
                title: template.title,
                category: template.category,
                imageBase64: template.imageBase64, // Store necessary info
                // price: template.price // If you add price later
            });

            // Save the updated cart back to localStorage
            localStorage.setItem('cart', JSON.stringify(cart));

            alert(`${template.title} has been added to your cart.`);
        } catch (error) {
            console.error("Error adding to cart:", error);
            alert("Could not add item to cart.");
        }
    }

    // Editor modal functions
    function openEditor(template: any) { // Pass the whole template object
        selectedImage = template; // Store the template data if EditorModal needs more than just the image
        showEditor = true;
    }

    function closeEditor() {
        showEditor = false;
        selectedImage = null;
    }
</script>

<main class="container mx-auto px-4 sm:px-6 lg:px-8 min-h-screen py-6">
    <h1 class="text-2xl font-bold mb-4 text-gray-800">Order Templates</h1>

    <!-- Template List -->
    {#if templates.length > 0}
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {#each templates as template (template.templateId)}
                <div class="bg-white rounded-lg shadow-lg p-4 flex flex-col justify-between"> 
                    <div> 
                        <img src={template.imageBase64} alt={template.title} class="w-full h-48 object-cover rounded-lg mb-3" /> 
                        <h3 class="text-lg font-semibold mb-1">{template.title}</h3> 
                        <p class="text-sm text-gray-600 mb-3">{template.category}</p> 
                    </div>
                   
                    <div class="flex flex-col sm:flex-row sm:flex-wrap gap-2 mt-auto">
                        <Button
                            size="sm"
                            on:click={() => { selectedTemplate = template; orderModalOpen = true; }}
                            class="w-full sm:w-auto flex-grow"
                            style="background-color: #1D4ED8; color: white; border: none; padding: 0.375rem 0.75rem; border-radius: 0.375rem; font-size: 0.875rem; line-height: 1.25rem;"
                          
                            on:mouseover={e => (e.currentTarget as HTMLElement)?.style.setProperty('background-color', '#1E40AF')}
                            on:mouseout={e => (e.currentTarget as HTMLElement)?.style.setProperty('background-color', '#1D4ED8')}
                        >
                            Order
                        </Button>
                        <Button
                            size="sm"
                            color="alternative"
                            on:click={() => addToCart(template)}
                            class="w-full sm:w-auto flex-grow"
                            style="background-color: white; color: #1f2937; border: 1px solid #d1d5db; padding: 0.375rem 0.75rem; border-radius: 0.375rem; font-size: 0.875rem; line-height: 1.25rem;"
                           
                            on:mouseover={e => (e.currentTarget as HTMLElement)?.style.setProperty('background-color', '#F9FAFB')}
                            on:mouseout={e => (e.currentTarget as HTMLElement)?.style.setProperty('background-color', 'white')}
                        >
                            Add to Cart
                        </Button>
                        <Button
                            size="sm"
                            color="light"
                            on:click={() => openEditor(template)}
                            class="w-full sm:w-auto flex-grow"
                            style="background-color: #F9FAFB; color: #1f2937; border: 1px solid #d1d5db; padding: 0.375rem 0.75rem; border-radius: 0.375rem; font-size: 0.875rem; line-height: 1.25rem;"
                           
                            on:mouseover={e => (e.currentTarget as HTMLElement)?.style.setProperty('background-color', '#F3F4F6')}
                            on:mouseout={e => (e.currentTarget as HTMLElement)?.style.setProperty('background-color', '#F9FAFB')}
                        >
                            Customize
                        </Button>
                    </div>
                </div>
            {/each}
        </div>
    {:else}
        <p class="text-center text-gray-500 mt-10">Loading templates or no templates found...</p>
      
    {/if}


    <!-- Order Modal -->
    <Modal title="Confirm Order" bind:open={orderModalOpen} autoclose> 
        {#if selectedTemplate}
            <p class="text-base leading-relaxed text-gray-500 dark:text-gray-400">
                Are you sure you want to order the template: <strong>{selectedTemplate.title}</strong>?
            </p>
        {/if}
        <div class="flex justify-end pt-4 gap-2"> 
             <Button color="alternative" on:click={() => orderModalOpen = false}>Cancel</Button>
             <Button color="blue" on:click={placeOrder}>Confirm Order</Button> 
        </div>
    </Modal>

    <!-- Toast Notification -->
    {#if showToast}
      <Toast class="fixed bottom-5 right-5 z-50" color="green" dismissable> 
          <svelte:fragment slot="icon">
              <CheckCircleSolid class="w-5 h-5" />
              <span class="sr-only">Check icon</span>
          </svelte:fragment>
          Order placed successfully!
      </Toast>
    {/if}

    <!-- Editor Modal -->
    {#if showEditor && selectedImage}
        <EditorModal
            image={selectedImage} 
            on:close={closeEditor} 
        />
    {/if}
</main>

<style>
  
    img {
        max-width: 100%;
        height: auto; 
    }
</style>