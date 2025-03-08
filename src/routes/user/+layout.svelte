<script>
    import { onMount } from 'svelte';
    import { Sidebar, SidebarWrapper, SidebarItem, SidebarGroup } from 'flowbite-svelte';
    import { ChartPieSolid, ClipboardListSolid, UploadSolid, BarsOutline, CloseOutline } from 'flowbite-svelte-icons';
  
    let site = {
      name: '',
      href: '/',
      img: '/images/logo.png'
    };
  
    let isSidebarOpen = false;
  
    function toggleSidebar() {
      isSidebarOpen = !isSidebarOpen;
    }
  
    // Close sidebar when clicking outside
    /**
     * @param {{ target: any; }} event
     */
    function handleClickOutside(event) {
      const target = event.target; 
      if (isSidebarOpen && target instanceof HTMLElement && !target.closest('.sidebar')) {
        isSidebarOpen = false;
      }
    }
  
    onMount(() => {
      document.addEventListener('click', handleClickOutside);
      return () => {
        document.removeEventListener('click', handleClickOutside);
      };
    });
  </script>
  
  <style>
    .app-container {
      height: 100vh;
      display: flex;
    }
    
    /* Ensures that sidebar and content are properly aligned */
    .content-area {
      flex-grow: 1;
      min-height: 100vh;
      padding: 1rem; /* Adjust padding */
      overflow: auto;
    }
  
    @media (min-width: 768px) {
     
    }
  </style>
  
  <div class="app-container">
    <!-- Mobile Menu Button -->
    <button 
      class="absolute top-4 left-4 md:hidden z-50 bg-black text-white p-3 rounded-full shadow-lg transition 
      duration-200 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
      on:click={toggleSidebar}
    >
      {#if isSidebarOpen}
        <CloseOutline class="w-6 h-6" />
      {:else}
        <BarsOutline class="w-6 h-6" />
      {/if}
    </button>
  
    <!-- Sidebar -->
    <Sidebar 
      class="sidebar w-64 h-full fixed md:relative z-40 bg-[#fddb22] shadow-lg transition-transform duration-300 ease-in-out transform 
      {isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}"
    >
      <SidebarWrapper class="h-full">
        <SidebarGroup>
          <div class="flex justify-center items-center py-4">
            <img src={site.img} alt="Logo" class="w-24 h-24 max-w-full max-h-full object-contain" />
          </div>
  
          <SidebarItem label="Dashboard" href="/user/dashboard" class="text-black font-semibold hover:bg-gray-200 rounded-md p-2">
            <svelte:fragment slot="icon">
              <ChartPieSolid class="w-6 h-6 text-black transition duration-75 group-hover:text-gray-700" />
            </svelte:fragment>
          </SidebarItem>
  
          <SidebarItem label="Orders" href="/user/orders" class="text-black font-semibold hover:bg-gray-200 rounded-md p-2">
            <svelte:fragment slot="icon">
              <ClipboardListSolid class="w-6 h-6 text-black transition duration-75 group-hover:text-gray-700" />
            </svelte:fragment>
          </SidebarItem>
  
          <SidebarItem label="Upload Templates" href="/user/home" class="text-black font-semibold hover:bg-gray-200 rounded-md p-2">
            <svelte:fragment slot="icon">
              <UploadSolid class="w-6 h-6 text-black transition duration-75 group-hover:text-gray-700" />
            </svelte:fragment>
          </SidebarItem>
          
        </SidebarGroup>
      </SidebarWrapper>
    </Sidebar>
  
    <!-- Page Content -->
    <div class="content-area">
      <slot />
    </div>
  </div>
  