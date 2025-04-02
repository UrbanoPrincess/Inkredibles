<script lang="ts">
    import { Toast } from 'flowbite-svelte';
    import { CheckCircleSolid, ExclamationCircleSolid, UploadOutline, LinkOutline, CartOutline, BedOutline } from 'flowbite-svelte-icons'; // Added CubeOutline for Order
    import { getFirestore, collection, getDocs, addDoc, Timestamp } from 'firebase/firestore';
    import { firebaseConfig } from "$lib/firebaseConfig";
    import { initializeApp, getApps, getApp } from "firebase/app";
    import { getAuth } from 'firebase/auth';
    import { Modal, Button, Label, Input, Textarea, Spinner, Radio } from 'flowbite-svelte';

    // --- Firebase Initialization ---
    const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    const db = getFirestore(app);
    const auth = getAuth(app);

    // --- Shared Drive Link ---
    const SHARED_DRIVE_FOLDER_LINK = "https://drive.google.com/drive/folders/1MEp2uC52ZK5NbxRMYmk3Y_DZHNvC1KGo?usp=drive_link";

    // --- Template Data ---
    let templates: any[] = [];
    let isLoadingTemplates = true;
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

    // --- Toast State ---
    let showSuccessToast = false;
    let successToastMessage = '';
    let showErrorToast = false;
    let errorToastMessage = '';

    // --- File Size Limit ---
    const MAX_UPLOAD_SIZE_BYTES = 700 * 1024; 

    // --- Fetch Templates ---
    async function fetchTemplates() {
        isLoadingTemplates = true;
        try {
            const querySnapshot = await getDocs(collection(db, "templates"));
            templates = querySnapshot.docs.map(doc => ({ templateId: doc.id, ...doc.data() }));
        } catch (error) {
            console.error("Error fetching templates:", error);
            showErrorToast = true;
            errorToastMessage = 'Failed to load templates.';
            setTimeout(() => showErrorToast = false, 3000);
        } finally {
            isLoadingTemplates = false;
        }
    }

    fetchTemplates();

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

    // --- Open Order Modal ---
    function openOrderModal(template: any) { 
        selectedTemplateForOrder = template;
        resetOrderForm(); 
        orderModalOpen = true;
    }

    // --- Close Order Modal ---
    function closeOrderModal() { 
        orderModalOpen = false; 
    }

    // --- Handle Method Change ---
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

        orderError = null; // Use renamed error state
        userImageBase64 = null;
        userImageFile = null;

        if (file) {
            if (!file.type.startsWith('image/')) {
                orderError = 'Please select an image file (jpg, png, gif, etc.).';
                if (orderFileInput) orderFileInput.value = '';
                return;
            }
            if (file.size > MAX_UPLOAD_SIZE_BYTES) {
                orderError = `Image size (${(file.size / 1024).toFixed(1)} KB) exceeds the limit (${(MAX_UPLOAD_SIZE_BYTES / 1024).toFixed(0)} KB). Please use the Shared Drive option or choose a smaller image.`;
                 if (orderFileInput) orderFileInput.value = '';
                return;
            }

            userImageFile = file;
            const reader = new FileReader();
            reader.onload = (e) => {
                userImageBase64 = e.target?.result as string;
            };
            reader.onerror = (e) => {
                console.error("FileReader error:", e);
                orderError = 'Could not read the selected file.';
                userImageBase64 = null;
                userImageFile = null;
                 if (orderFileInput) orderFileInput.value = '';
            };
            reader.readAsDataURL(file);
        }
    }

    // --- Submit Custom Order ---
    async function submitCustomOrder() { // Renamed
        orderError = null;

 
        if (uploadMethod === 'direct' && (!userImageBase64 || !userImageFile)) {
             orderError = "Please upload an image or switch to the Shared Drive option."; return;
        }
        if (uploadMethod === 'drive' && !userDriveReference.trim()) {
             orderError = "Please provide the filename or link for your image in the Shared Drive."; return;
        }
        if (!userText.trim()) {
             orderError = "Please enter the text you want to add."; return;
        }
        if (!selectedTemplateForOrder) {
             orderError = "Error: No template selected. Please close and retry."; return;
        }
        const user = auth.currentUser;
        if (!user) {
            orderError = "Please log in to place an order."; return;
        }

        isSubmittingOrder = true; // Renamed

        try {
            const orderData: any = {
                type: 'customized_order', 
                templateId: selectedTemplateForOrder.templateId,
                templateTitle: selectedTemplateForOrder.title,
                userEmail: user.email,
                orderedAt: Timestamp.fromDate(new Date()), 
                status: 'Pending', // Initial status
                userText: userText.trim(),
                uploadMethod: uploadMethod,
            };

            // Add method-specific data
            if (uploadMethod === 'direct') {
                orderData.userImageBase64 = userImageBase64;
                orderData.userImageOriginalName = userImageFile?.name;
                orderData.userImageOriginalSize = userImageFile?.size;
            } else { // 'drive'
                orderData.userDriveReference = userDriveReference.trim();
            }

            // Save to Firestore 'orders' collection
            await addDoc(collection(db, "orders"), orderData);

            // 4. Success Feedback
            closeOrderModal();
            showSuccessToast = true;
            successToastMessage = 'Order placed successfully!'
            setTimeout(() => showSuccessToast = false, 4000);

        } catch (error) {
            console.error("Error placing order:", error); // Updated log message
            orderError = `Order failed: ${error instanceof Error ? error.message : String(error)}`; 
            showErrorToast = true; // Show general error toast as well
            errorToastMessage = 'Failed to place order. Please try again.'; // Updated message
            setTimeout(() => showErrorToast = false, 4000);
        } finally {
            isSubmittingOrder = false; // Renamed
        }
    }

    function addToCart(template: any) {
         try {
            const storedCart = localStorage.getItem('cart');
            const cart = storedCart ? JSON.parse(storedCart) : [];
            const exists = cart.some((item: any) => item.templateId === template.templateId);
            if (exists) {
                 showErrorToast = true;
                 errorToastMessage = `${template.title} is already in your cart.`;
                 setTimeout(() => showErrorToast = false, 3000);
                 return;
            }
            cart.push({
                templateId: template.templateId,
                title: template.title,
                category: template.category,
                imageBase64: template.imageBase64,
                quantity: 1
            });
            localStorage.setItem('cart', JSON.stringify(cart));
            showSuccessToast = true;
            successToastMessage = `${template.title} has been added to your cart.`;
            setTimeout(() => showSuccessToast = false, 3000);
        } catch (error) {
            console.error("Error adding to cart:", error);
            showErrorToast = true;
            errorToastMessage = 'Could not add item to cart.';
            setTimeout(() => showErrorToast = false, 3000);
        }
    }

</script>

<main class="container mx-auto px-4 sm:px-6 lg:px-8 min-h-screen py-6">

    <h1 class="text-2xl font-bold mb-6 text-gray-800">Choose a Template</h1>

    <!-- Template List -->
    {#if isLoadingTemplates}
         <div class="flex justify-center items-center py-10"> <Spinner size="8" /> <p class="ml-3 text-gray-600">Loading Templates...</p> </div>
    {:else if templates.length > 0}
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {#each templates as template (template.templateId)}
                <div class="bg-white rounded-lg shadow-lg p-4 flex flex-col justify-between border border-gray-200 hover:shadow-xl transition-shadow duration-200">
                    <!-- Template Image and Info -->
                    <div>
                        {#if template.imageBase64} <img src={template.imageBase64} alt={template.title} class="w-full h-48 object-cover rounded-lg mb-3" loading="lazy"/> {:else} <div class="w-full h-48 bg-gray-200 rounded-lg mb-3 flex items-center justify-center text-gray-500 text-sm">No Preview</div> {/if}
                        <h3 class="text-lg font-semibold mb-1 text-gray-900">{template.title}</h3>
                        <p class="text-sm text-gray-600 mb-3">{template.category}</p>
                    </div>
                    <div class="flex flex-col sm:flex-row gap-2 mt-auto pt-3 border-t border-gray-100">
                        <Button
                            size="sm"
                            on:click={() => openOrderModal(template)}
                            class="w-full "
                            style="background-color: #1D4ED8; color: white;"
                        >
                             Order 
                        </Button>
                        <Button
                            size="sm"
                            color="alternative"
                            on:click={() => addToCart(template)}
                            class="w-full"
                        >
                             Add to Cart 
                        </Button>
                    </div>
                </div>
            {/each}
        </div>
    {:else}
        <p class="text-center text-gray-500 mt-10">No templates found.</p>
    {/if}

    <!-- Order Modal (Renamed from Customization Request Modal) -->
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

                <!-- User Text Input -->
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
                    <Button type="submit" color="blue" disabled={isSubmittingOrder || (uploadMethod === 'direct' && !userImageBase64) || (uploadMethod === 'drive' && !userDriveReference.trim())}> 
                        {#if isSubmittingOrder}<Spinner class="mr-2" size="4" color="white" /> Placing Order...{:else}Place Order{/if} 
                    </Button>
                </div>
            </form>
        {:else}
            <p class="text-center text-gray-500">Loading template details...</p>
            <div class="flex justify-end pt-4"> <Button color="alternative" on:click={closeOrderModal}>Close</Button> </div> 
        {/if}
    </Modal>

    <!-- Toast Notifications -->
    {#if showSuccessToast} <Toast class="fixed bottom-5 right-5 z-50" color="green" dismissable on:close={() => showSuccessToast = false}> <svelte:fragment slot="icon"><CheckCircleSolid class="w-5 h-5" /> <span class="sr-only">Check icon</span></svelte:fragment> {successToastMessage} </Toast> {/if}
    {#if showErrorToast} <Toast class="fixed bottom-5 right-5 z-50" color="red" dismissable on:close={() => showErrorToast = false}> <svelte:fragment slot="icon"><ExclamationCircleSolid class="w-5 h-5" /> <span class="sr-only">Error icon</span></svelte:fragment> {errorToastMessage} </Toast> {/if}

</main>

<style>
  
     img { display: block; max-width: 100%; height: auto; }
    .prose a { color: #2563eb; }
    .prose a:hover { text-decoration: underline; }
</style>