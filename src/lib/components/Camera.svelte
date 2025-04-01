<script lang="ts">
  import "@fortawesome/fontawesome-free/css/all.min.css";
  
  export let selectedTemplate;
  export let closeModal; 
  
  let imageSrc: string =
    "https://storage.googleapis.com/a1aa/image/3LqDluUov3017iJ-9DL_yXZF2Hlivf2KX9l__-J1a48.jpg";
  
  //wala pang function
  function addToCart() {
    alert("✅ Added to Cart!");
  }
  
  function buyNow() {
    alert("🛒 Redirecting to Checkout...");
  }
  
  function updateImage(event: Event) {
    const target = event.target as HTMLInputElement;
    if (!target || !target.files || !target.files[0]) return;
    
    const file = target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target && typeof e.target.result === "string") {
        imageSrc = e.target.result;
      }
    };
    reader.readAsDataURL(file);
  }
</script>
<style>
  @import url("https://fonts.googleapis.com/css2?family=Great+Vibes&family=Arial&family=Times+New+Roman&display=swap");

  /* Modal Styling */
  .modal {
    display: flex;
    align-items: center;
    justify-content: center;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    z-index: 1000;
  }

  .modal-content {
    background: white;
    padding: 20px;
    border-radius: 10px;
    max-width: 900px;
    width: 95%;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    position: relative;
    min-height: 500px; /* Set a minimum height */
    max-height: 90vh; /* Limit the maximum height */
    overflow-y: auto; /* Allow scrolling if content exceeds max height */
  }

  .close-button {
    position: absolute;
    top: 10px; 
    right: 15px; 
    font-size: 24px;
    cursor: pointer;
    background: none;
    border: none;
    color: #333;
    z-index: 10; 
  }

  .close-button:hover {
    color: red;
  }

  .content-wrapper {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    justify-content: space-between;
    align-items: flex-start;
  }

  .left-panel,
  .right-panel {
    flex: 1 1 45%;
    min-width: 300px;
  }

  .left-panel {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .right-panel {
    display: flex;
    justify-content: center; 
    align-items: center; 
  }

  .image-frame {
    margin-top: 20px;
    width: 70%;
    max-width: 400px;
    height: auto;
    background: white;
    border: 10px solid white;
    box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.2);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .image-container {
    width: 100%;
    height: auto;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 5px;
  }

  .image-container img {
    max-width: 100%;
    max-height: 300px; 
    object-fit: contain; 
  }
  
  .image-frame {
    min-height: 350px;
  }

  /* Buttons */
  .button-group {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 20px;
    width: 100%;
  }

  .button {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 15px;
    font-size: 16px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .add-to-cart {
    background-color: #ffcc00;
    color: black;
  }

  .add-to-cart:hover {
    background-color: #e6b800;
  }

  .buy-now {
    background-color: #ff5722;
    color: white;
  }

  .buy-now:hover {
    background-color: #e64a19;
  }

  .button i {
    font-size: 18px;
  }

  label {
    font-weight: bold;
    margin-bottom: 5px;
    display: block;
  }

  input[type="file"] {
    width: 100%;
    padding: 8px;
    margin-bottom: 15px;
    border: 1px solid #ccc;
    border-radius: 4px;
    box-sizing: border-box;
  }

  @media (max-width: 768px) {
    .content-wrapper {
      flex-direction: column;
    }

    .left-panel,
    .right-panel {
      width: 100%;
      min-width: auto;
    }

    .image-frame {
      max-width: 100%;
    }
    
    .button-group {
      margin-top: 10px;
      justify-content: center; 
    }
  }
</style>

<!-- Modal -->
<div class="modal">
<div class="modal-content">
  <button class="close-button" on:click="{closeModal}" aria-label="Close modal">
    <i class="fas fa-xmark"></i>
  </button>

  <div class="content-wrapper">
    <div class="left-panel">
      <label for="upload-image">Upload Image:</label>
      <input
        id="upload-image"
        type="file"
        accept="image/*"
        on:change="{updateImage}"
      />

      <!-- Buttons: Add to Cart & Buy Now -->
      <div class="button-group">
        <button class="button add-to-cart" on:click="{addToCart}">
          <i class="fas fa-cart-shopping"></i> Add to Cart
        </button>
        <button class="button buy-now" on:click="{buyNow}">
          <i class="fas fa-credit-card"></i> Buy Now
        </button>
      </div>
    </div>

    <!-- Right Panel: Only shows the image frame -->
    <div class="right-panel">
      <div class="absolute right-20 top-1/2 transform -translate-y-1/2 flex flex-col items-center bg-black p-4 rounded-lg shadow-lg w-48 h-[325px]">
        
        <!-- Camera Mode Label -->
        <div class="text-gray-400 py-1 text-sm">JPEG</div>
    
        <!-- Image Frame -->
        <div class="mt-2 w-[90%] max-w-[150px] bg-white border-[6px] border-white shadow-lg flex flex-col items-center">
          <!-- Dynamic Image -->
          <div class="image-container">
            <img 
              alt="Dynamic custom image" 
              class="w-full h-[120px] object-cover"  
              src="{imageSrc}"
            />
          </div>
        </div>
        
        
    
        <!-- Camera Controls -->
        <div class="py-3 flex flex-col items-center">
          <div class="flex justify-center items-center space-x-4 mb-2">
            <i class="fas fa-bolt text-white text-sm"></i>
            <div class="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center">
              <div class="w-6 h-6 bg-gray-900 rounded-full"></div>
            </div>
            <i class="fas fa-sync-alt text-white text-sm"></i>
          </div>
    
          <div class="flex justify-center items-center space-x-2 mb-2">
            <span class="text-white text-xs">Camera</span>
            <span class="text-white bg-white text-black px-2 py-1 rounded-full text-xs">Portrait</span>
            <span class="text-white text-xs">Video</span>
          </div>
    
          <div class="flex justify-center items-center space-x-2">
            <i class="fas fa-images text-white text-sm"></i>
            <div class="flex space-x-1">
              <span class="text-white bg-gray-800 px-1 py-0.5 rounded-full text-xs">5</span>
              <span class="text-white bg-gray-800 px-1 py-0.5 rounded-full text-xs">1x</span>
              <span class="text-white bg-gray-800 px-1 py-0.5 rounded-full text-xs">3x</span>
            </div>
            <i class="fas fa-camera text-white text-sm"></i>
          </div>
        </div>
      </div>
    </div>
    
  </div>
</div>
</div>