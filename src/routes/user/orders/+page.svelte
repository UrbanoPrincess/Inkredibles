<script lang="ts">
    import { onMount } from 'svelte';
    import { getFirestore, collection, query, where, getDocs, Timestamp, orderBy } from 'firebase/firestore';
    import { firebaseConfig } from "$lib/firebaseConfig"; // Make sure this path is correct
    import { initializeApp, getApps, getApp } from "firebase/app";
    import { getAuth, onAuthStateChanged, type User } from 'firebase/auth';
    import { Spinner } from 'flowbite-svelte'; // Import Spinner for loading state

    // --- Firebase Initialization ---
    // Ensure Firebase is initialized only once
    const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    const db = getFirestore(app);
    const auth = getAuth(app);

    // --- Component State ---
    let orders: any[] = []; // Array to hold orders from Firestore
    let isLoadingOrders = true; // Loading state indicator
    let fetchError: string | null = null; // Error message state
    let currentUser: User | null = null; // Store the current user object

    // --- Fetch Orders from Firestore ---
    async function fetchUserOrders(userEmail: string) {
        isLoadingOrders = true;
        fetchError = null;
        orders = []; // Clear previous orders

        try {
            // Create a query against the 'orders' collection
            const ordersRef = collection(db, "orders");
            const q = query(
                ordersRef,
                where("userEmail", "==", userEmail), // Filter by logged-in user's email
                orderBy("orderedAt", "desc") // Show newest orders first
            );

            const querySnapshot = await getDocs(q);

            orders = querySnapshot.docs.map(doc => ({
                id: doc.id, // Include the document ID
                ...doc.data()
            }));

        } catch (error) {
            console.error("Error fetching orders:", error);
            fetchError = "Failed to load your orders. Please try again later.";
        } finally {
            isLoadingOrders = false;
        }
    }

    // --- Format Firestore Timestamp ---
    function formatTimestamp(timestamp: Timestamp | undefined | null): string {
        if (!timestamp) return 'N/A';
        // Convert Firestore Timestamp to JavaScript Date
        const date = timestamp.toDate();
        // Format the date (you can customize this further)
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true // Use AM/PM
        });
        // Or use UTC+8 directly if needed, though toLocaleDateString often handles local timezone
        // return date.toLocaleString('en-SG', { timeZone: 'Asia/Singapore', /* other options */ });
    }

    // --- Lifecycle Hook ---
    onMount(() => {
        // Listen for authentication state changes
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            currentUser = user;
            if (user && user.email) {
                // User is logged in, fetch their orders
                fetchUserOrders(user.email);
            } else {
                // User is logged out or email is not available
                isLoadingOrders = false;
                orders = []; // Clear orders if user logs out
                // Optional: Set an error or message if needed when logged out
                // fetchError = "Please log in to view your orders.";
            }
        });

        // Cleanup subscription on component destroy
        return () => unsubscribe();
    });

    // Removed clearOrders function as it was tied to localStorage

</script>

<main class="container mx-auto px-4 sm:px-6 lg:px-8 min-h-screen py-6">
    <h1 class="text-2xl font-bold mb-6 text-gray-800">Your Orders</h1>

    {#if isLoadingOrders}
        <div class="flex justify-center items-center py-10">
            <Spinner size="8" />
            <p class="ml-3 text-gray-600">Loading your orders...</p>
        </div>
    {:else if !currentUser}
         <p class="text-center text-gray-500 mt-10">Please log in to view your orders.</p>
    {:else if fetchError}
        <div class="p-4 text-sm text-red-700 bg-red-100 rounded-lg text-center" role="alert">
            <span class="font-medium">Error:</span> {fetchError}
        </div>
    {:else if orders.length === 0}
        <p class="text-center text-gray-500 mt-10">You have no orders yet.</p>
    {:else}
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {#each orders as order (order.id)}
                <div class="bg-white rounded-lg shadow-lg p-4 border border-gray-200 flex flex-col">
                    {#if order.type === 'customized_order' && order.userImageBase64}
                        <!-- Display user-uploaded image for custom orders if available -->
                        <img src={order.userImageBase64} alt="Custom Order Preview" class="w-full h-48 object-contain rounded-lg mb-3 bg-gray-100" loading="lazy"/>
                    {:else if order.templateImageBase64}
                         <!-- TODO: Display template image if stored in order (Requires adding this field during order creation) -->
                         <img src={order.templateImageBase64} alt={order.templateTitle} class="w-full h-48 object-cover rounded-lg mb-3" loading="lazy"/>
                    {:else}
                         <!-- Fallback if no image is available -->
                         <div class="w-full h-48 bg-gray-200 rounded-lg mb-3 flex items-center justify-center text-gray-500 text-sm">No Image Preview</div>
                    {/if}

                    <h3 class="mt-2 text-lg font-semibold text-gray-900">{order.templateTitle || 'Order Item'}</h3>
                    <!-- Removed category as it's not in the Firestore data example -->
                    <!-- <p class="text-sm text-gray-600">{order.category}</p> -->

                    <div class="mt-2 text-sm space-y-1 text-gray-600">
                        <p>
                            <span class="font-medium text-gray-700">Status:</span>
                            <span class:text-yellow-600={order.status === 'Pending'}
                                  class:text-blue-600={order.status === 'Processing'}
                                  class:text-green-600={order.status === 'Completed'}
                                  class:text-red-600={order.status === 'Cancelled'}>
                                {order.status || 'N/A'}
                            </span>
                        </p>
                        {#if order.type === 'customized_order'}
                         <p><span class="font-medium text-gray-700">Type:</span> Customized</p>
                         <p><span class="font-medium text-gray-700">Text Added:</span> "{order.userText}"</p>
                         <p><span class="font-medium text-gray-700">Image Upload:</span> {order.uploadMethod === 'direct' ? 'Direct' : 'Shared Drive'}</p>
                         {#if order.uploadMethod === 'drive'}
                            <p class="text-xs truncate"><span class="font-medium text-gray-700">Drive Ref:</span> {order.userDriveReference}</p>
                         {/if}
                        {:else}
                         <!-- Add details for non-custom orders if needed -->
                         <p><span class="font-medium text-gray-700">Type:</span> Standard</p>
                        {/if}
                         <p><span class="font-medium text-gray-700">Ordered On:</span> {formatTimestamp(order.orderedAt)}</p>
                    </div>
                </div>
            {/each}
        </div>
    {/if}

</main>

<style>
    /* Optional: Add specific styles if needed */
    img { display: block; max-width: 100%; height: auto; }
</style>