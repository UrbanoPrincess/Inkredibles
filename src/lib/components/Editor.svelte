<script lang="ts">
    import "@fortawesome/fontawesome-free/css/all.min.css";
    
    export let selectedTemplate;
    export let closeModal; 
    
    let imageSrc: string =
      "https://storage.googleapis.com/a1aa/image/3LqDluUov3017iJ-9DL_yXZF2Hlivf2KX9l__-J1a48.jpg";
    let customText: string = "Customized Text";
    let textColor: string = "#000000"; 
    let fontFamily: string = "great-vibes"; 
    let fontSize: string = "text-lg"; 
    
  //wala pang function
    function addToCart() {
      alert("✅ Added to Cart!");
    }
    
  
    function buyNow() {
      alert("🛒 Redirecting to Checkout...");
    }
    
    function updateContent(event: Event, type: "image" | "text") {
      const target = event.target as HTMLInputElement;
      if (!target) return;
    
      if (type === "image" && target.files && target.files[0]) {
        const file = target.files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target && typeof e.target.result === "string") {
            imageSrc = e.target.result;
          }
        };
        reader.readAsDataURL(file);
      } else if (type === "text") {
        customText = target.value;
      }
    }
    </script>
   <style>
    @import url("https://fonts.googleapis.com/css2?family=Great+Vibes&family=Arial&family=Times+New+Roman&display=swap");

    .great-vibes {
      font-family: "Great Vibes", cursive;
    }
    .arial {
      font-family: Arial, sans-serif;
    }
    .times {
      font-family: "Times New Roman", serif;
    }

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
      justify-content: flex-start; 
    }

    .image-container {
      width: 100%;
      height: auto;
      max-height: 300px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 5px;
    }

    .image-container img {
        margin-top: -20px;
    max-width: 100%;
    max-height: 250px; 
    object-fit: contain; 
  }
  .image-frame {
     
      min-height: 350px;
  }

    .text-preview {
      width: 100%;
      text-align: center;
      padding: 10px;
      min-height: 30px; 
      display: flex;
      align-items: center;
      justify-content: center;
      box-sizing: border-box; 
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

    input[type="text"],
    input[type="color"],
    select,
    input[type="file"] {
      width: 100%;
      padding: 8px;
      margin-bottom: 15px;
      border: 1px solid #ccc;
      border-radius: 4px;
      box-sizing: border-box;
    }

    select {
      height: 38px;
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
            on:change="{(e) => updateContent(e, 'image')}"
          />

          <label for="enter-text">Enter Text:</label>
          <input
            id="enter-text"
            type="text"
            on:input="{(e) => updateContent(e, 'text')}"
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

        <!-- Right Panel: Framed Image & Text -->
        <div class="right-panel">
          <div class="image-frame">
            <div class="image-container" style="padding-top: 40px;">  <!-- Increase padding -->
              <img src="{imageSrc}" alt="{customText || 'Custom image'}" />
            </div>
            <p
              class="text-preview {fontFamily} {fontSize}"
              style="color: {textColor};"
            >
              {customText || "Your Text Here"}
            </p>
          </div>
        </div>
      </div>


    </div>
  </div>