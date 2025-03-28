<script lang="ts">
    import { onMount } from 'svelte';
    import { Button } from 'flowbite-svelte'; // Import the Button component
    import { goto } from '$app/navigation'; // Import the goto function for navigation

    // Cart data
    let cart: any[] = [];
    let orders: any[] = []; // Array to hold orders

    // Load cart and orders from local storage
    onMount(() => {
        const storedCart = localStorage.getItem('cart');
        if (storedCart) {
            cart = JSON.parse(storedCart);
        }

        const storedOrders = localStorage.getItem('orders');
        if (storedOrders) {
            orders = JSON.parse(storedOrders);
        }
    });

    // Remove item from cart
    function removeFromCart(templateId: string) {
        cart = cart.filter(item => item.templateId !== templateId);
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    // Clear cart
    function clearCart() {
        cart = [];
        localStorage.removeItem('cart');
    }

    // Place order for a specific item
    function placeOrder(template: any) {
        // Add the item to orders
        orders.push({ ...template, status: 'Pending' }); // Add status to the order
        localStorage.setItem('orders', JSON.stringify(orders)); // Save orders to local storage

        // Remove the item from the cart
        removeFromCart(template.templateId);

        // Navigate to the orders page
        goto('/user/orders'); // Adjust the path as necessary
    }
</script>

<main class="container mx-auto px-4 sm:px-6 lg:px-8 min-h-screen py-6">
    <h1 class="text-2xl font-bold mb-4">Your Cart</h1>

    {#if cart.length === 0}
        <p>Your cart is empty.</p>
    {:else}
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {#each cart as item (item.templateId)}
                <div class="bg-white rounded-lg shadow-lg p-4">
                    <img src={item.imageBase64} alt={item.title} class="w-full h-auto rounded-lg" />
                    <h3 class="mt-2 font-semibold">{item.title}</h3>
                    <p class="text-gray-600">{item.category}</p>
                    <Button on:click={() => removeFromCart(item.templateId)} class="mt-2 bg-red-500 text-white">Remove</Button>
                    <Button on:click={() => placeOrder(item)} class="mt-2 bg-blue-500 text-white">Place Order</Button> <!-- Place Order Button for each item -->
                </div>
            {/each}
        </div>
        <Button on:click={clearCart} class="mt-4 bg-red-500 text-white">Clear Cart</Button>
    {/if}
</main>