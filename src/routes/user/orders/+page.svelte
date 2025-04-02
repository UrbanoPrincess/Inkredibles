<script lang="ts">
    import { onMount } from 'svelte';

    let orders: any[] = []; // Array to hold orders

    // Load orders from local storage
    onMount(() => {
        const storedOrders = localStorage.getItem('orders');
        if (storedOrders) {
            orders = JSON.parse(storedOrders);
        }
    });
    function clearOrders() {
    localStorage.removeItem('orders'); // Remove 'orders' from local storage
    orders = []; // Clear the local array as well
}

</script>

<main class="container mx-auto px-4 sm:px-6 lg:px-8 min-h-screen py-6">
    <h1 class="text-2xl font-bold mb-4">Your Orders</h1>

    {#if orders.length === 0}
        <p>You have no orders yet.</p>
    {:else}
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {#each orders as order (order.templateId)}
                <div class="bg-white rounded-lg shadow-lg p-4">
                    <img src={order.imageBase64} alt={order.title} class="w-full h-auto rounded-lg" />
                    <h3 class="mt-2 font-semibold">{order.title}</h3>
                    <p class="text-gray-600">{order.category}</p>
                    <p class="text-gray-500">Status: {order.status}</p>
                </div>
            {/each}
        </div>
    {/if}
 
</main>