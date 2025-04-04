<!-- src/lib/components/Editor.svelte -->
<script lang="ts">
  import "@fortawesome/fontawesome-free/css/all.min.css";
  import html2canvas from 'html2canvas';
  import { createEventDispatcher, onMount } from 'svelte'; 

  export let image: any = null; 
  const dispatch = createEventDispatcher(); 

  // --- Internal State ---
  let imageSrc: string = "/images/sample-frame.jpg"; 
  let customText: string = "Customized Text";
  let textColor: string = "#000000";
  let fontFamily: string = "great-vibes";
  let fontSize: string = "text-lg";

  let imageFrameElement: HTMLDivElement;
  let isSaving: boolean = false;

  onMount(() => {
   
    if (image && image.imageBase64) {
      imageSrc = image.imageBase64;
    }
    if (image && image.title) {
      customText = image.title; 
    }
  
  });

  function handleClose() {
    dispatch('close'); 
  }

  function addToCart() {
 
    alert("✅ Added to Cart! (Editor version - Implement actual logic)");

  }

  function buyNow() {
    alert("🛒 Redirecting to Checkout... (Editor version - Implement actual logic)");
 
  }

  async function saveImage() {
    if (!imageFrameElement) {
      console.error("Image frame element not found!");
      alert("Error: Cannot find the image preview element.");
      return;
    }
    isSaving = true;
    alert("Generating image, please wait...");
    try {

      const canvas = await html2canvas(imageFrameElement, { 
          useCORS: true,
          allowTaint: true,
        
      });
      const imageMimeType = 'image/png';
      const imageDataUrl = canvas.toDataURL(imageMimeType);
      const link = document.createElement('a');
      link.href = imageDataUrl;
      link.download = `customized-${image?.title || 'image'}-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      alert("✅ Image saved successfully!");
    } catch (error) {
      console.error("Error generating image:", error);
      alert("❌ Failed to save image. Check console for details.");
    } finally {
        isSaving = false;
    }
  }

  function updateContent(event: Event, type: "image" | "text") {
    const target = event.target as HTMLInputElement;
    if (!target) return;

    if (type === "image" && target.files && target.files[0]) {
      const file = target.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target && typeof e.target.result === "string") {
          imageSrc = e.target.result; // Update internal image source
        }
      };
      reader.readAsDataURL(file);
    } else if (type === "text") {
   
    }
  }
</script>

<style>
  @import url("https://fonts.googleapis.com/css2?family=Great+Vibes&family=Arial&family=Times+New+Roman&display=swap");
  .great-vibes { font-family: "Great Vibes", cursive; }
  .arial { font-family: Arial, sans-serif; }
  .times { font-family: "Times New Roman", serif; }

  .modal { display: flex; align-items: center; justify-content: center; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.5); z-index: 1000; }
  .modal-content { background: white; padding: 20px; border-radius: 10px; max-width: 900px; width: 95%; display: flex; flex-direction: column; align-items: stretch; position: relative; max-height: 90vh; overflow-y: auto; }
  .close-button { position: absolute; top: 10px; right: 15px; font-size: 24px; cursor: pointer; background: none; border: none; color: #333; z-index: 10; }
  .close-button:hover { color: red; }
  .content-wrapper { display: flex; flex-wrap: wrap; gap: 20px; justify-content: space-between; align-items: flex-start; }

  .left-panel, .right-panel { flex: 1 1 45%; min-width: 300px; }
  .left-panel { display: flex; flex-direction: column; gap: 10px; }

  .right-panel {
    display: flex;
    flex-direction: column; /* Stack items vertically */
    align-items: center;    /* Center items horizontally */
    justify-content: flex-start; /* Align items to the top */
    gap: 20px; /* Add gap between image frame and buttons */
  }

  /* Image Preview Frame */
  .image-frame { width: 90%; max-width: 400px; height: auto; background: white; border: 10px solid white; box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.2); display: flex; flex-direction: column; align-items: center; justify-content: flex-start; min-height: 350px; box-sizing: border-box; }
  .image-container { width: 100%; height: auto; max-height: 300px; display: flex; align-items: center; justify-content: center; padding: 5px; box-sizing: border-box; }
  .image-container img { max-width: 100%; max-height: 250px; object-fit: contain; }
  .text-preview { width: 100%; text-align: center; padding: 10px 5px; min-height: 30px; display: flex; align-items: center; justify-content: center; box-sizing: border-box; word-wrap: break-word; }

  
  .button-group {
    display: flex;
    justify-content: center; 
    gap: 10px;
    width: 90%; 
    max-width: 400px; 
    flex-wrap: nowrap; 
  }

  /* Individual Buttons */
  .button { display: flex; align-items: center; gap: 8px; padding: 10px 15px; font-size: 16px; border: none; border-radius: 5px; cursor: pointer; transition: all 0.3s ease; flex-shrink: 0; /* Prevent buttons from shrinking too much */ }
  .button i { font-size: 18px; }
  .add-to-cart { background-color: #ffcc00; color: black; }
  .add-to-cart:hover { background-color: #e6b800; }
  .buy-now { background-color: #ff5722; color: white; }
  .buy-now:hover { background-color: #e64a19; }
  .save-image { background-color: #4CAF50; color: white; }
  .save-image:hover { background-color: #45a049; }
  .save-image:disabled { background-color: #cccccc; cursor: not-allowed; }

  label { font-weight: bold; margin-bottom: 5px; display: block; }
  input[type="text"], input[type="color"], select, input[type="file"] { width: 100%; padding: 8px; margin-bottom: 15px; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box; }
  select { height: 38px;  }
 
  @media (max-width: 768px) {
    .modal-content { padding: 15px; }
    .content-wrapper { flex-direction: column; }
    .left-panel, .right-panel { width: 100%; min-width: auto; flex: 1 1 auto;  }
    .right-panel {
       gap: 15px; 
    }
    .image-frame { max-width: 100%; width: 100%;  }
    .button-group {
       width: 100%; 
       max-width: none;
       justify-content: center; 
    }
    .button {
      padding: 8px 12px; 
      font-size: 14px; 
    }
    .button i {
      font-size: 16px;
    }
    .close-button { top: 5px; right: 10px; }
  }
</style>

<!-- Modal Structure -->
<div class="modal">
  <div class="modal-content">
    <!-- Use the handleClose function which dispatches the 'close' event -->
    <button class="close-button" on:click={handleClose} aria-label="Close modal">
      <i class="fas fa-xmark"></i>
    </button>

    <div class="content-wrapper">
      <!-- Left Panel: Controls -->
      <div class="left-panel">
        <h2 class="text-xl font-semibold mb-4">Customize Template</h2>

        <label for="upload-image">Upload Replacement Image:</label>
        <input
          id="upload-image"
          type="file"
          accept="image/*"
          on:change="{(e) => updateContent(e, 'image')}"
        />

        <label for="enter-text">Enter Text:</label>
        <input
          id="enter-text"
          type="text"
          bind:value={customText}
        />

        <label for="font-style">Font Style:</label>
        <select id="font-style" bind:value={fontFamily}>
          <option value="great-vibes">Great Vibes</option>
          <option value="arial">Arial</option>
          <option value="times">Times New Roman</option>
        </select>

        <label for="text-color">Text Color:</label>
        <input id="text-color" type="color" bind:value={textColor} />

        <label for="text-size">Text Size:</label>
        <select id="text-size" bind:value={fontSize}>
          <option value="text-sm">Small</option>
          <option value="text-lg">Medium</option>
          <option value="text-2xl">Large</option>
        </select>

        <!-- Buttons were MOVED from here -->

      </div>

      <!-- Right Panel: Framed Image & Text Preview -->
      <div class="right-panel">
        <!-- The element to capture for saving image -->
        <div class="image-frame" bind:this={imageFrameElement}>
          <div class="image-container">
            <img
               src="{imageSrc}"
               alt="{customText || 'Custom image preview'}"
               loading="lazy"
            />
          </div>
          <p
            class="text-preview {fontFamily} {fontSize}"
            style="color: {textColor};"
          >
            {customText || "Your Text Here"}
          </p>
        </div>
        <!-- Buttons: Add to Cart, Buy Now & Save Image -->
        <div class="button-group">
          <button class="button add-to-cart" on:click={addToCart}>
            <i class="fas fa-cart-shopping"></i> Add to Cart
          </button>
          <button class="button buy-now" on:click={buyNow}>
            <i class="fas fa-credit-card"></i> Buy Now
          </button>
          <button
             class="button save-image"
             on:click={saveImage}
             disabled={isSaving}
           >
             <i class="fas fa-download"></i> {isSaving ? 'Saving...' : 'Save Image'}
           </button>
        </div>
      </div> 
    </div> 
  </div>
</div> 