<script lang="ts">
    import { onMount } from 'svelte';
    import { getFirestore, collection, query, getDocs, Timestamp, orderBy, doc, updateDoc } from 'firebase/firestore'; 
    import { firebaseConfig } from "$lib/firebaseConfig";
    import { initializeApp, getApps, getApp } from "firebase/app";
    import { Spinner, Table, TableBody, TableBodyCell, TableBodyRow, TableHead, TableHeadCell, Select } from 'flowbite-svelte'; 
    import { DownloadOutline, FolderOpenOutline, CheckCircleSolid, ExclamationCircleSolid } from 'flowbite-svelte-icons'; 
    import { Toast } from 'flowbite-svelte';

    // --- Firebase Initialization ---
    const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    const db = getFirestore(app);

    // --- Component State ---
    let allOrders: any[] = [];
    let isLoadingOrders = true;
    let fetchError: string | null = null;
    let isUpdatingStatus = false; 
    let updatingStatusId: string | null = null; 

    const SHARED_DRIVE_FOLDER_LINK = "https://drive.google.com/drive/folders/1MEp2uC52ZK5NbxRMYmk3Y_DZHNvC1KGo?usp=drive_link";

    // --- Toast State ---
    let showSuccessToast = false;
    let successToastMessage = '';
    let showErrorToast = false;
    let errorToastMessage = '';

    const orderStatuses = ['Pending', 'Processing', 'Completed', 'Cancelled'];

    async function fetchAllOrders() {
        
        isLoadingOrders = true;
        fetchError = null;
        allOrders = [];

        try {
            const ordersRef = collection(db, "orders");
            const q = query(ordersRef, orderBy("orderedAt", "desc"));
            const querySnapshot = await getDocs(q);
            allOrders = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error("Error fetching all orders:", error);
            fetchError = `Failed to load orders: ${error instanceof Error ? error.message : String(error)}`;
            if (error instanceof Error && error.message.includes('index')) {
                 fetchError += " Check Firestore index configuration.";
            }
        } finally {
            isLoadingOrders = false;
        }
    }

    async function updateOrderStatus(orderId: string, newStatus: string) {
        if (!orderId || !newStatus) return;

        updatingStatusId = orderId; 
        isUpdatingStatus = true; 

        try {
            const orderRef = doc(db, "orders", orderId); 
            await updateDoc(orderRef, {
                status: newStatus 
            });

            allOrders = allOrders.map(order =>
                order.id === orderId ? { ...order, status: newStatus } : order
            );

            // Show success feedback
            showSuccessToast = true;
            successToastMessage = `Order ${orderId.substring(0, 5)}... status updated to ${newStatus}.`;
            setTimeout(() => showSuccessToast = false, 3000);

        } catch (error) {
            console.error("Error updating order status:", error);
            // Show error feedback
            showErrorToast = true;
            errorToastMessage = `Failed to update status for order ${orderId.substring(0, 5)}...`;
            setTimeout(() => showErrorToast = false, 4000);
        } finally {
            updatingStatusId = null; 
            isUpdatingStatus = false;
        }
    }


    // --- Format Timestamp ---
    function formatTimestamp(timestamp: Timestamp | undefined | null): string {
        // ... (format logic remains the same) ...
        if (!timestamp) return 'N/A';
        const date = timestamp.toDate();
        return date.toLocaleDateString('en-CA', {
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit', hour12: false
        });
    }

    // --- Get Fallback Filename ---
    function getDownloadFilename(originalName: string | undefined | null, orderId: string): string {
       // ... (filename logic remains the same) ...
        if (originalName) {
            return originalName.replace(/[^a-zA-Z0-9._-]/g, '_');
        }
        return `order_${orderId}_image.jpg`;
    }


    onMount(() => {
        fetchAllOrders();
    });

</script>

<main class="container mx-auto px-4 sm:px-6 lg:px-8 min-h-screen py-6">
    <h1 class="text-2xl font-bold mb-6 text-gray-800">Admin - All Orders</h1>
    <p class="text-sm text-orange-600 bg-orange-100 p-2 rounded mb-4">Note: This page currently lacks admin-only protection.</p>

    {#if isLoadingOrders}
        <!-- Loading Spinner -->
         <div class="flex justify-center items-center py-10">
            <Spinner size="8" /> <p class="ml-3 text-gray-600">Loading all orders...</p>
        </div>
    {:else if fetchError}
        <!-- Error Message -->
         <div class="p-4 text-sm text-red-700 bg-red-100 rounded-lg text-center" role="alert">
            <span class="font-medium">Error:</span> {fetchError}
        </div>
    {:else if allOrders.length === 0}
        <!-- No Orders Message -->
        <p class="text-center text-gray-500 mt-10">No orders found.</p>
    {:else}
        <!-- Orders Table -->
        <div class="overflow-x-auto relative shadow-md sm:rounded-lg">
            <Table hoverable={true}>
                <TableHead>
                    <TableHeadCell>Order Date</TableHeadCell>
                    <TableHeadCell>User Email</TableHeadCell>
                    <TableHeadCell>Template</TableHeadCell>
                    <TableHeadCell>Type</TableHeadCell>
                    <TableHeadCell>Status</TableHeadCell> 
                    <TableHeadCell>Details & Actions</TableHeadCell>
                </TableHead>
                <TableBody>
                    {#each allOrders as order (order.id)}
                        <TableBodyRow>
                            <TableBodyCell class="whitespace-nowrap font-medium text-gray-900">
                                {formatTimestamp(order.orderedAt)}
                            </TableBodyCell>
                            <TableBodyCell>{order.userEmail || 'N/A'}</TableBodyCell>
                            <TableBodyCell>{order.templateTitle || 'N/A'}</TableBodyCell>
                            <TableBodyCell>
                                {order.type === 'customized_order' ? 'Custom' : 'Standard'}
                            </TableBodyCell>
                            <TableBodyCell class="min-w-[150px]"> 
                                <div class="flex items-center space-x-2">
                                    <Select
                                        items={orderStatuses.map(status => ({ value: status, name: status }))}
                                        value={order.status}
                                        on:change={(e) => {
                                            const target = e.target;
                                            if (target instanceof HTMLSelectElement) updateOrderStatus(order.id, target.value);
                                        }}
                                        disabled={updatingStatusId === order.id}
                                        size="sm"
                                        class="flex-grow"
                                    />
                                    {#if updatingStatusId === order.id}
                                        <Spinner size="4" color="blue"/>
                                    {/if}
                                </div>
                            </TableBodyCell>
                            <TableBodyCell class="text-xs space-y-1">
                                {#if order.type === 'customized_order'}
                                    <p><strong>Text:</strong> "{order.userText}"</p>
                                    {#if order.uploadMethod === 'direct'}
                                        <!-- Direct Upload Download Link -->
                                        <div class="flex items-center space-x-2">
                                            <span><strong>Img:</strong> Direct</span>
                                            {#if order.userImageBase64}
                                                <a href={order.userImageBase64} download={getDownloadFilename(order.userImageOriginalName, order.id)}
                                                   class="text-xs inline-flex items-center px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                                                   title="Download: {order.userImageOriginalName || 'image'}">
                                                   <DownloadOutline class="w-3 h-3 mr-1"/> Download
                                                </a>
                                            {:else} <span class="text-gray-400 text-xs">(No data)</span> {/if}
                                        </div>
                                        {#if order.userImageOriginalName}<p class="text-gray-500 text-[10px]">({order.userImageOriginalName})</p>{/if}
                                    {:else if order.uploadMethod === 'drive'}
                                        <!-- Shared Drive Link -->
                                        <div class="flex items-center space-x-2">
                                             <span><strong>Img:</strong> Drive</span>
                                             <a href={SHARED_DRIVE_FOLDER_LINK} target="_blank" rel="noopener noreferrer"
                                                class="text-xs inline-flex items-center px-2 py-1 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 transition-colors"
                                                title="Open Shared Drive folder">
                                                <FolderOpenOutline class="w-3 h-3 mr-1"/> Open Folder
                                             </a>
                                        </div>
                                         <p class="text-gray-500 text-[10px] truncate" title={order.userDriveReference}>Ref: {order.userDriveReference || 'N/A'}</p>
                                    {:else} <p><strong>Img:</strong> Unknown</p> {/if}
                                {:else} <span>-</span> {/if}
                            </TableBodyCell>
                        </TableBodyRow>
                    {/each}
                </TableBody>
            </Table>
        </div>
        <p class="text-xs text-gray-500 mt-2">Total Orders: {allOrders.length}</p>
    {/if}

     <!-- Toast Notifications -->
    {#if showSuccessToast} <Toast class="fixed bottom-5 right-5 z-50" color="green" dismissable on:close={() => showSuccessToast = false}> <svelte:fragment slot="icon"><CheckCircleSolid class="w-5 h-5" /> <span class="sr-only">Check icon</span></svelte:fragment> {successToastMessage} </Toast> {/if}
    {#if showErrorToast} <Toast class="fixed bottom-5 right-5 z-50" color="red" dismissable on:close={() => showErrorToast = false}> <svelte:fragment slot="icon"><ExclamationCircleSolid class="w-5 h-5" /> <span class="sr-only">Error icon</span></svelte:fragment> {errorToastMessage} </Toast> {/if}

</main>

<style>
    td, th { vertical-align: middle; }
</style>