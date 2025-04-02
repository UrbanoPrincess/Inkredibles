<script lang="ts">
  import { Navbar, NavBrand, NavLi, NavUl, NavHamburger, Modal, Button, Spinner } from 'flowbite-svelte'; // Added Modal, Button, Spinner
  import { ChartPieSolid, ClipboardListSolid, UploadSolid,ArrowLeftToBracketOutline, ExclamationCircleOutline } from 'flowbite-svelte-icons'; // Added LogoutOutline, ExclamationTriangleOutline
  import { goto } from '$app/navigation'; // Import for navigation
  import { getAuth, signOut } from 'firebase/auth'; // Import Firebase Auth functions
  import { firebaseConfig } from "$lib/firebaseConfig"; // Adjust path if needed
  import { initializeApp, getApps, getApp } from "firebase/app"; // Firebase App
  import { onDestroy } from 'svelte'; // To potentially clean up listeners if needed, though not strictly required for simple signOut

  // --- Firebase Initialization (Ensure it runs only once) ---
  const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  const auth = getAuth(app);

  // --- Site Config ---
  let site = {
    name: 'The Inkredibles',
    href: '/',
    img: '/images/logo.png' 
  };

  // --- Logout Modal State ---
  let logoutModalOpen = false;
  let isLoggingOut = false;

  // --- Functions ---
  function openLogoutModal() {
    logoutModalOpen = true;
  }

  function closeLogoutModal() {
    logoutModalOpen = false;
  }

  async function handleLogout() {
    isLoggingOut = true;
    try {
      await signOut(auth);
      // Logout successful
      closeLogoutModal();
      goto('/login'); 
    
    } catch (error) {
      console.error("Error logging out:", error);
      // Optional: Show an error toast message here
      alert(`Logout failed: ${error instanceof Error ? error.message : String(error)}`); // Simple alert for now
    } finally {
      isLoggingOut = false;
    }
  }

 

</script>

<style>
  .app-container {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  .content-area {
    flex-grow: 1;
    overflow-y: auto; 
     padding: 1rem;
  }

  :global(body > div[role="dialog"] + div[modal-backdrop]) {
    z-index: 40; 
  }
   :global(body > div[role="dialog"]) {
    z-index: 50; 
  }


</style>

<div class="app-container">

 <Navbar
    class="flowbite-navbar bg-[#fddb22] shadow-md px-5 py-2 relative z-20"
    let:hidden="{navHidden}"
    let:toggle
 >
    <NavBrand href={site.href}>
       <img src={site.img} alt="Logo" class="h-12 w-auto object-contain mr-3" />
       <!-- <span class="self-center whitespace-nowrap text-xl font-semibold text-black">{site.name}</span> -->
    </NavBrand>

    <NavHamburger
        on:click={toggle}
        class="md:hidden text-black focus:outline-none focus:ring-2 focus:ring-gray-400 rounded-md"
    />

    <NavUl
        hidden="{navHidden}"
        class="
            flex-col md:flex-row
            absolute md:relative
            top-[72px] md:top-auto
            left-0 md:left-auto
            right-0 md:right-auto
            w-full md:w-auto
            p-4 md:p-0
            bg-[#fddb22] md:bg-transparent
            shadow-md md:shadow-none
            space-y-2 md:space-y-0
            md:space-x-4
            items-stretch md:items-center
            z-10
            {navHidden ? 'hidden' : 'flex'}
        "
    >
        <!-- Navigation Links -->
        <NavLi class="w-full md:w-auto">
            <a href="/user/order-templates" class="text-black font-semibold hover:bg-gray-200 rounded-md p-2 text-sm flex items-center w-full md:w-auto justify-center md:justify-start">
                <ChartPieSolid class="w-5 h-5 inline-block mr-1" /> Templates
            </a>
        </NavLi>
        <NavLi class="w-full md:w-auto">
            <a href="/user/cart" class="text-black font-semibold hover:bg-gray-200 rounded-md p-2 text-sm flex items-center w-full md:w-auto justify-center md:justify-start">
                <ClipboardListSolid class="w-5 h-5 inline-block mr-1" /> Cart
            </a>
        </NavLi>
        <NavLi class="w-full md:w-auto">
            <a href="/user/orders" class="text-black font-semibold hover:bg-gray-200 rounded-md p-2 text-sm flex items-center w-full md:w-auto justify-center md:justify-start">
                <UploadSolid class="w-5 h-5 inline-block mr-1" /> Orders
            </a>
        </NavLi>

         <!-- Logout Button -->
         <NavLi class="w-full md:w-auto mt-2 md:mt-0 pt-2 md:pt-0 border-t border-gray-300 md:border-t-0 md:ml-4"> 
             <button
                 type="button"
                 on:click={openLogoutModal}
                 class="text-red-700 bg-red-100 hover:bg-red-200 font-semibold rounded-md p-2 text-sm flex items-center w-full md:w-auto justify-center md:justify-start"
             >
                 <ArrowLeftToBracketOutline class="w-5 h-5 inline-block mr-1" /> Logout
             </button>
         </NavLi>
    </NavUl>
 </Navbar>

  <!-- Main Content Area -->
  <div class="content-area">
    <slot />
  </div>

  <!-- Logout Confirmation Modal -->
  <Modal
      title="Confirm Logout"
      bind:open={logoutModalOpen}
      on:close={closeLogoutModal}
      size="xs"
      autoclose={false}
  >
      <div class="text-center">
          <ExclamationCircleOutline class="mx-auto mb-4 text-gray-400 w-12 h-12" />
          <h3 class="mb-5 text-lg font-normal text-gray-500">
              Are you sure you want to log out?
          </h3>
          <div class="flex justify-center gap-4">
              <Button
                  color="red"
                  on:click={handleLogout}
                  disabled={isLoggingOut}
                  class="min-w-[100px]"
              >
                  {#if isLoggingOut}
                      <Spinner class="mr-2" size="4" color="white" /> Logging out...
                  {:else}
                      Yes, I'm sure
                  {/if}
              </Button>
              <Button
                  color="alternative"
                  on:click={closeLogoutModal}
                  disabled={isLoggingOut}
              >
                  No, cancel
              </Button>
          </div>
      </div>
  </Modal>

</div>