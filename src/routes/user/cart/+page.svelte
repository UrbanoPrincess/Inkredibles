<script lang="ts">
    import { onMount } from 'svelte';
    import { Toast } from 'flowbite-svelte';
    import { CheckCircleSolid, ExclamationCircleSolid, UploadOutline, LinkOutline } from 'flowbite-svelte-icons'; 
    import { getFirestore, collection, addDoc, Timestamp } from 'firebase/firestore'; 
    import { firebaseConfig } from "$lib/firebaseConfig"; 
    import { initializeApp, getApps, getApp } from "firebase/app"; 
    import { getAuth, onAuthStateChanged, type User } from 'firebase/auth'; 
    import { Modal, Button, Label, Input, Textarea, Spinner, Radio } from 'flowbite-svelte'; 

    // --- Firebase Initialization ---
    const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    const db = getFirestore(app);
    const auth = getAuth(app);

    let cart: any[] = [];
    let currentUser: User | null = null;

    let orderModalOpen = false;
    let selectedTemplateForOrder: any = null;
    let uploadMethod: 'direct' | 'drive' = 'direct';
    let userImageFile: File | null = null;
    let userImageBase64: string | null = null;
    let userDriveReference = '';
    let userText = '';
    let isSubmittingOrder = false;
    let orderError: string | null = null;
    let orderFileInput: HTMLInputElement;
    const SHARED_DRIVE_FOLDER_LINK = "https://drive.google.com/drive/folders/1MEp2uC52ZK5NbxRMYmk3Y_DZHNvC1KGo?usp=drive_link"; 
    const MAX_UPLOAD_SIZE_BYTES = 700 * 1024;

    let showSuccessToast = false;
    let successToastMessage = '';
    let showErrorToast = false;
    let errorToastMessage = '';

    onMount(() => {
        const storedCart = localStorage.getItem('cart');
        if (storedCart) {
            cart = JSON.parse(storedCart);
        }

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            currentUser = user;
           
        });

        return () => unsubscribe(); 
    });

    function removeFromCart(templateId: string) {
        cart = cart.filter(item => item.templateId !== templateId);
        localStorage.setItem('cart', JSON.stringify(cart));
        // Optional: Show feedback toast
        showSuccessToast = true;
        successToastMessage = 'Item removed from cart.';
        setTimeout(() => showSuccessToast = false, 3000);
    }


    function resetOrderForm() {
        uploadMethod = 'direct';
        userImageFile = null;
        userImageBase64 = null;
        userDriveReference = '';
        userText = '';
        orderError = null;
        isSubmittingOrder = false;
        if (orderFileInput) {
            orderFileInput.value = '';
        }
    }

    function openOrderModalForItem(item: any) {
        if (!currentUser) {
            showErrorToast = true;
            errorToastMessage = 'Please log in to place an order.';
            setTimeout(() => showErrorToast = false, 3000);
            return; 
        }
        selectedTemplateForOrder = item; 
        resetOrderForm();
        orderModalOpen = true;
    }

    function closeOrderModal() {
        orderModalOpen = false;
    }

    function handleMethodChange() {
       orderError = null;
       if (uploadMethod === 'direct') {
           userDriveReference = '';
       } else {
           userImageFile = null;
           userImageBase64 = null;
           if (orderFileInput) {
                orderFileInput.value = '';
           }
       }
   }

   function handleUserImageUpload(event: Event) {
       if (uploadMethod !== 'direct') return;
       const target = event.target as HTMLInputElement;
       const file = target.files?.[0];
       orderError = null;
       userImageBase64 = null;
       userImageFile = null;

       if (file) {
           if (!file.type.startsWith('image/')) {
               orderError = 'Please select an image file.';
               if (orderFileInput) orderFileInput.value = ''; return;
           }
           if (file.size > MAX_UPLOAD_SIZE_BYTES) {
               orderError = `Image size (${(file.size / 1024).toFixed(1)} KB) exceeds limit (${(MAX_UPLOAD_SIZE_BYTES / 1024).toFixed(0)} KB). Use Shared Drive or smaller image.`;
                if (orderFileInput) orderFileInput.value = ''; return;
           }
           userImageFile = file;
           const reader = new FileReader();
           reader.onload = (e) => { userImageBase64 = e.target?.result as string; };
           reader.onerror = (e) => {
               console.error("FileReader error:", e);
               orderError = 'Could not read file.'; userImageBase64 = null; userImageFile = null;
                if (orderFileInput) orderFileInput.value = '';
           };
           reader.readAsDataURL(file);
       }
   }

    async function submitCustomOrder() {
        orderError = null;

        // 1. Validation (Same as before)
        if (uploadMethod === 'direct' && (!userImageBase64 || !userImageFile)) {
             orderError = "Please upload an image or switch to Shared Drive."; return;
        }
        if (uploadMethod === 'drive' && !userDriveReference.trim()) {
             orderError = "Please provide filename/link from Shared Drive."; return;
        }
        if (!userText.trim()) {
             orderError = "Please enter the text to add."; return;
        }
        if (!selectedTemplateForOrder) {
             orderError = "Error: No template selected. Close and retry."; return;
        }
        // Use the currentUser state variable
        if (!currentUser || !currentUser.email) {
            orderError = "Please log in to place an order.";
            showErrorToast = true; 
            errorToastMessage = 'You must be logged in to order.';
            setTimeout(() => showErrorToast = false, 4000);
            return;
        }


        isSubmittingOrder = true;

        try {
      
            const orderData: any = {
                type: 'customized_order',
                templateId: selectedTemplateForOrder.templateId,
                templateTitle: selectedTemplateForOrder.title, 
                userEmail: currentUser.email,
                orderedAt: Timestamp.fromDate(new Date()),
                status: 'Pending',
                userText: userText.trim(),
                uploadMethod: uploadMethod,
      
            };

            if (uploadMethod === 'direct') {
                orderData.userImageBase64 = userImageBase64;
                orderData.userImageOriginalName = userImageFile?.name;
                orderData.userImageOriginalSize = userImageFile?.size;
            } else {
                orderData.userDriveReference = userDriveReference.trim();
            }

            await addDoc(collection(db, "orders"), orderData);

            const orderedItemId = selectedTemplateForOrder.templateId; 
            cart = cart.filter(item => item.templateId !== orderedItemId);
            localStorage.setItem('cart', JSON.stringify(cart));
         
            closeOrderModal();
            showSuccessToast = true;
            successToastMessage = 'Order placed successfully!';
            setTimeout(() => showSuccessToast = false, 4000);

        } catch (error) {
            console.error("Error placing order:", error);
            orderError = `Order failed: ${error instanceof Error ? error.message : String(error)}`;
            showErrorToast = true;
            errorToastMessage = 'Failed to place order. Please try again.';
            setTimeout(() => showErrorToast = false, 4000);
        } finally {
            isSubmittingOrder = false;
        }
    }


</script>

<main class="container mx-auto px-4 sm:px-6 lg:px-8 min-h-screen py-6">
    <h1 class="text-2xl font-bold mb-6 text-gray-800">Your Cart</h1>

    {#if cart.length === 0}
        <p class="text-center text-gray-500 mt-10">Your cart is empty.</p>
    {:else}
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {#each cart as item (item.templateId)}
                <div class="bg-white rounded-lg shadow-lg p-4 border border-gray-200 flex flex-col justify-between">
                    <div>
                        {#if item.imageBase64}
                             <img src={item.imageBase64} alt={item.title} class="w-full h-48 object-cover rounded-lg mb-3" loading="lazy"/>
                        {:else}
                            <div class="w-full h-48 bg-gray-200 rounded-lg mb-3 flex items-center justify-center text-gray-500 text-sm">No Preview</div>
                        {/if}
                        <h3 class="text-lg font-semibold mb-1 text-gray-900">{item.title}</h3>
                        <p class="text-sm text-gray-600 mb-3">{item.category}</p>
                   
                    </div>
                 
                    <div class="mt-auto pt-3 border-t border-gray-100 flex flex-col sm:flex-row gap-2">
                       
                        <Button
                            size="sm"
                            on:click={() => openOrderModalForItem(item)}
                            class="w-full"
                            style="background-color: #1D4ED8; color: white;"
                         >
                            Customize & Order
                        </Button>
                        <Button
                            size="sm"
                            color="alternative"
                            on:click={() => removeFromCart(item.templateId)}
                            class="w-full"
                        >
                            Remove
                        </Button>
                    </div>
                </div>
            {/each}
        </div>
   
    {/if}

    <Modal
        title="Order '{selectedTemplateForOrder?.title || 'Template'}' with Your Details"
        bind:open={orderModalOpen}
        on:close={closeOrderModal}
        size="lg"
        autoclose={false}
    >
         {#if selectedTemplateForOrder}
            <form on:submit|preventDefault={submitCustomOrder} class="space-y-5">

                <!-- Image Source Selection -->
                <fieldset class="border border-gray-300 p-3 rounded-md">
                    <legend class="text-sm font-medium text-gray-900 px-1">Provide Your Image <span class="text-red-600">*</span></legend>
                    <div class="flex flex-col sm:flex-row gap-4 mt-2">
                         <div class="flex items-center"><Radio name="uploadMethod" value="direct" bind:group={uploadMethod} on:change={handleMethodChange}>Direct Upload</Radio></div>
                         <div class="flex items-center"><Radio name="uploadMethod" value="drive" bind:group={uploadMethod} on:change={handleMethodChange}>Use Shared Drive</Radio></div>
                    </div>
                </fieldset>

                <!-- Conditional Input Area -->
                <div class="border border-gray-200 p-4 rounded-md bg-gray-50 min-h-[150px]">
                    {#if uploadMethod === 'direct'}
                        <!-- Direct Upload Section -->
                        <div>
                            <Label for="orderFileInput" class="block mb-2 text-sm font-medium text-gray-900">Upload Image</Label>
                            <input bind:this={orderFileInput} class="block w-full text-sm text-gray-900 bg-white rounded-lg border border-gray-300 cursor-pointer focus:outline-none" id="orderFileInput" type="file" accept="image/*" on:change={handleUserImageUpload} required={uploadMethod === 'direct'} disabled={isSubmittingOrder} />
                            <p class="mt-1 text-xs text-gray-500">Max file size: {(MAX_UPLOAD_SIZE_BYTES / 1024).toFixed(0)} KB. PNG, JPG, GIF etc.</p>
                            {#if userImageBase64} <div class="mt-3"><p class="text-xs font-medium text-gray-700 mb-1">Preview:</p><img src={userImageBase64} alt="Preview" class="rounded border border-gray-300 max-w-full max-h-28 object-contain bg-white" />{#if userImageFile}<p class="text-xs text-gray-500 mt-1">Size: {(userImageFile.size / 1024).toFixed(1)} KB</p>{/if}</div>{/if}
                        </div>
                    {:else if uploadMethod === 'drive'}
                        <!-- Shared Drive Section -->
                        <div>
                             <Label for="driveReference" class="block mb-2 text-sm font-medium text-gray-900">Image Filename/Link from Shared Drive</Label>
                             <div class="prose prose-sm max-w-none text-gray-600 mb-3">
                                 <p>1. Upload your image to our shared Google Drive folder: <a href={SHARED_DRIVE_FOLDER_LINK} target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline break-all">{SHARED_DRIVE_FOLDER_LINK} <LinkOutline class="inline w-3 h-3 ml-1"/></a><br/>(Ensure filename is unique).</p>
                                 <p>2. Paste the <strong>exact filename</strong> (e.g., <code>my_photo.jpg</code>) or the <strong>direct link to your file</strong> below.</p>
                            </div>
                            <Input type="text" id="driveReference" placeholder="e.g., my_image.png or https://..." bind:value={userDriveReference} required={uploadMethod === 'drive'} disabled={isSubmittingOrder} class={orderError && uploadMethod === 'drive' && !userDriveReference.trim() ? 'border-red-500' : ''} />
                        </div>
                    {/if}
                </div>


                 <div>
                    <Label for="userText" class="block mb-2 text-sm font-medium text-gray-900">Text to Add <span class="text-red-600">*</span></Label>
                    <Textarea
                        id="userText"
                        placeholder="Enter the exact text you want placed on the template..."
                        rows={3}
                        bind:value={userText}
                        required
                        disabled={isSubmittingOrder}
                        class={orderError && !userText.trim() ? 'border-red-500' : ''}
                    />
                </div>

                 <!-- Error Display Area -->
                {#if orderError} <div class="p-3 text-sm text-red-700 bg-red-100 rounded-lg" role="alert"><ExclamationCircleSolid class="inline w-4 h-4 mr-1.5 align-text-bottom"/><span class="font-medium">Error:</span> {orderError}</div>{/if}

                <!-- Modal Actions -->
                <div class="flex justify-end items-center pt-4 gap-3 border-t border-gray-200">
                    <Button type="button" color="alternative" on:click={closeOrderModal} disabled={isSubmittingOrder}>Cancel</Button>
                    <Button type="submit" color="blue" disabled={isSubmittingOrder || (uploadMethod === 'direct' && !userImageBase64 && !userDriveReference.trim()) || (uploadMethod === 'drive' && !userDriveReference.trim()) || !userText.trim()}>
                        {#if isSubmittingOrder}<Spinner class="mr-2" size="4" color="white" /> Placing Order...{:else}Place Order{/if}
                    </Button>
                </div>
            </form>
        {:else}
            <p class="text-center text-gray-500">Loading template details...</p>
            <div class="flex justify-end pt-4"> <Button color="alternative" on:click={closeOrderModal}>Close</Button> </div>
        {/if}
    </Modal>

    {#if showSuccessToast} <Toast class="fixed bottom-5 right-5 z-50" color="green" dismissable on:close={() => showSuccessToast = false}> <svelte:fragment slot="icon"><CheckCircleSolid class="w-5 h-5" /> <span class="sr-only">Check icon</span></svelte:fragment> {successToastMessage} </Toast> {/if}
    {#if showErrorToast} <Toast class="fixed bottom-5 right-5 z-50" color="red" dismissable on:close={() => showErrorToast = false}> <svelte:fragment slot="icon"><ExclamationCircleSolid class="w-5 h-5" /> <span class="sr-only">Error icon</span></svelte:fragment> {errorToastMessage} </Toast> {/if}

</main>

<style>
 
     img { display: block; max-width: 100%; height: auto; }
    .prose a { color: #2563eb; }
    .prose a:hover { text-decoration: underline; }
    :global(.modal-body) {
         overflow-y: auto;
    }
</style>