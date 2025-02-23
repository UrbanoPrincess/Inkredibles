<script>
    import { Sidebar, SidebarWrapper, SidebarItem, SidebarGroup } from 'flowbite-svelte';
    import { ChartPieSolid, ClipboardListSolid, UploadSolid } from 'flowbite-svelte-icons';

    let site = {
      name: '',
      href: '/',
      img: '/images/logo.png'
    };
</script>

<div class="flex h-screen">
  <!-- Sidebar -->
  <Sidebar class="h-screen w-64">
    <SidebarWrapper>
      <SidebarGroup>
        <!-- Logo -->
        <div class="flex justify-center items-center py-4">
          <img src={site.img} alt="Logo" class="w-24 h-24 max-w-full max-h-full object-contain" />
        </div>

        <!-- Sidebar Items -->
        <SidebarItem label="Dashboard" href="/admin/dashboard">
          <svelte:fragment slot="icon">
            <ChartPieSolid class="w-6 h-6 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
          </svelte:fragment>
        </SidebarItem>

        <SidebarItem label="Orders" href="/admin/orders">
          <svelte:fragment slot="icon">
            <ClipboardListSolid class="w-6 h-6 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
          </svelte:fragment>
        </SidebarItem>
     
        <SidebarItem label="Upload Templates" href="/admin/upload-templates">
          <svelte:fragment slot="icon">
            <UploadSolid class="w-6 h-6 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
          </svelte:fragment>
        </SidebarItem>
      </SidebarGroup>
    </SidebarWrapper>
  </Sidebar>

  <!-- Page Content (this will change dynamically) -->
  <div class="flex-1 p-6">
    <slot />  <!-- This is where the page content will be displayed -->
  </div>
</div>
