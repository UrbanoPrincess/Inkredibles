<script lang="ts">
    let imageSrc: string =
      "https://storage.googleapis.com/a1aa/image/3LqDluUov3017iJ-9DL_yXZF2Hlivf2KX9l__-J1a48.jpg";
    let customText: string = "Customized Text";
    let imageText: string = "Your Image Here";
    let textColor: string = "#000000"; 
    let fontFamily: string = "Great Vibes"; 
    let fontSize: string = "text-lg"; 
  
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
        imageText = target.value;
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
  </style>
  
  <div class="flex items-center justify-center min-h-screen bg-gray-100">
    <div class="bg-white p-8 shadow-lg border border-gray-300">
      <div class="text-center">
        <div class="bg-black p-4">
       
          <img src="{imageSrc}" alt="" class="mx-auto" width="300" height="300" />
        </div>
        <p class="mt-4 {fontFamily} {fontSize}" style="color: {textColor}">
          {customText}
        </p>
      </div>
  
      <div class="mt-4">
        <label for="upload-image" class="block">Upload Image:</label>
        <input id="upload-image" type="file" accept="image/*" class="block w-full mb-2 p-2 border border-gray-300" on:change="{(e) => updateContent(e, 'image')}" />
  
        <label for="enter-text" class="block">Enter Text:</label>
        <input id="enter-text" type="text" placeholder="Enter your text" class="block w-full mb-2 p-2 border border-gray-300" on:input="{(e) => updateContent(e, 'text')}" />
  
        <label for="font-style" class="block">Font Style:</label>
        <select id="font-style" bind:value={fontFamily} class="block w-full mb-2 p-2 border border-gray-300">
          <option value="great-vibes">Great Vibes</option>
          <option value="arial">Arial</option>
          <option value="times">Times New Roman</option>
        </select>
  
        <label for="text-color" class="block">Text Color:</label>
        <input id="text-color" type="color" bind:value={textColor} class="block w-full mb-2 p-2 border border-gray-300" />
  
        <label for="text-size" class="block">Text Size:</label>
        <select id="text-size" bind:value={fontSize} class="block w-full mb-2 p-2 border border-gray-300">
          <option value="text-sm">Small</option>
          <option value="text-lg">Medium</option>
          <option value="text-2xl">Large</option>
        </select>
      </div>
    </div>
  </div>
  