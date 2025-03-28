<script lang="ts">
    import { Toast } from 'flowbite-svelte';
    import { CheckCircleSolid } from 'flowbite-svelte-icons';
    import { getFirestore, collection, getDocs, addDoc } from 'firebase/firestore';
    import { firebaseConfig } from "$lib/firebaseConfig";
    import { initializeApp, getApps, getApp } from "firebase/app";
    import { getAuth } from 'firebase/auth';
    import { Modal, Button } from 'flowbite-svelte';

    // Firebase initialization
    const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    const db = getFirestore(app);
    const auth = getAuth(app);

    // Template data
    let templates: any[] = [];
    let selectedTemplate: any = null;
    let orderModalOpen = false;
    let showToast = false;

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
            const user = auth.currentUser ;
            const orderData = {
                templateId: selectedTemplate.templateId,
                userEmail: user ? user.email : "Anonymous",
                orderedAt: new Date(),
            };

            await addDoc(collection(db, "orders"), orderData);
            showToast = true;
            orderModalOpen = false;
            setTimeout(() => (showToast = false), 3000);
        } catch (error) {
            console.error("Error placing order:", error);
            alert("Failed to place order. Please try again.");
        }
    }

    // Add to cart function
    function addToCart(template: any) {
        // Load existing cart from localStorage
        const storedCart = localStorage.getItem('cart');
        const cart = storedCart ? JSON.parse(storedCart) : [];

        // Add the new template to the cart
        cart.push(template);

        // Save the updated cart back to localStorage
        localStorage.setItem('cart', JSON.stringify(cart));

        alert(`${template.title} has been added to your cart.`);
    }
</script>

<main class="container mx-auto px-4 sm:px-6 lg:px-8 min-h-screen py-6">
    <h1 class="text-2xl font-bold mb-4">Order Templates</h1>

    <!-- Template List -->
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {#each templates as template (template.templateId)}
            <div class="bg-white rounded-lg shadow-lg p-4">
                <img src={template.imageBase64} alt={template.title} class="w-full h-auto rounded-lg" />
                <h3 class="mt-2 font-semibold">{template.title}</h3>
                <p class="text-gray-600">{template.category}</p>
                <Button on:click={() => { selectedTemplate = template; orderModalOpen = true; }} class="mt-2 bg-blue-500 text-white">Order</Button>
                <Button on:click={() => addToCart(template)} class="mt-2 bg-green-500 text-white">Add to Cart</Button>
            </div>
        {/each}
    </div>

    <!-- Order Modal -->
    <Modal open={orderModalOpen} on:close={() => orderModalOpen = false}>
        <div class="p-6">
            <h2 class="text-xl font-semibold mb-4">Confirm Order</h2>
            <p>Are you sure you want to order the template: <strong>{selectedTemplate?.title}</strong>?</p>
            <Button on:click={placeOrder} class="mt-4 w-full bg-blue-500 text-white">Confirm Order</Button>
        </div>
    </Modal>

    {#if showToast}
        <Toast on:click={() => showToast = false} class="mt-4">
            <CheckCircleSolid class="w-6 h-6 text-green-500" />
            Order placed successfully!
        </Toast>
    {/if}
</main>