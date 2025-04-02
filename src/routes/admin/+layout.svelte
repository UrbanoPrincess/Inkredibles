<script>
  import { Navbar, NavBrand, NavLi, NavUl, NavHamburger } from 'flowbite-svelte';
  import { ChartPieSolid, ClipboardListSolid, UploadSolid } from 'flowbite-svelte-icons';

  
  let site = {
    name: 'The Inkredibles', 
    href: '/',
    img: '/images/logo.png' 
  };


</script>

<style>
  .app-container {
    height: 100vh;
    display: flex;
    flex-direction: column;
  }

  .content-area {
    flex-grow: 1;
    padding: 1rem;
    overflow: auto;

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
 </NavBrand>

 <NavHamburger
   on:click={toggle}
   class="md:hidden text-black"
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

   <NavLi class="w-full md:w-auto">
     <a href="/admin/upload-templates" class="text-black font-semibold hover:bg-gray-200 rounded-md p-2 text-sm flex items-center w-full md:w-auto justify-center md:justify-start">
       <ChartPieSolid class="w-5 h-5 inline-block mr-1" /> 
       Templates
     </a>
   </NavLi>
   <!-- 
    <NavLi class="w-full md:w-auto">
      <a href="/user/cart" class="text-black font-semibold hover:bg-gray-200 rounded-md p-2 text-sm flex items-center w-full md:w-auto justify-center md:justify-start">
        <ClipboardListSolid class="w-5 h-5 inline-block mr-1" /> 
        Cart
      </a>
    </NavLi>
   -->
    
   <NavLi class="w-full md:w-auto">
     <a href="/admin/orders" class="text-black font-semibold hover:bg-gray-200 rounded-md p-2 text-sm flex items-center w-full md:w-auto justify-center md:justify-start">
       <UploadSolid class="w-5 h-5 inline-block mr-1" /> 
       Orders
     </a>
   </NavLi>
 </NavUl>
</Navbar>

  <div class="content-area">
    <slot />
  </div>
</div>