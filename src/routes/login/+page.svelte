<script lang="ts">
    import { Button, Label, Input, Checkbox } from 'flowbite-svelte';
    import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
    import { firebaseConfig } from "$lib/firebaseConfig";
    import { initializeApp, getApps, getApp } from "firebase/app";
    import { goto } from '$app/navigation';
    import { EnvelopeSolid, LockSolid } from 'flowbite-svelte-icons'; // Import icons
    import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
  
    const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    const auth = getAuth(app);
    const db = getFirestore(app);

    let email = "";
    let password = "";
    let errorMessage = "";
    let isLoading = false; // Add loading state
    let rememberMe = false; // Add remember me state
  
    async function loginUser() {
    isLoading = true;
    errorMessage = "";

    try {
        if (!email || !password) {
            throw { code: "auth/missing-fields" };
        }

        console.log("Attempting login with email:", email);

        // Sign in user
        const { user } = await signInWithEmailAndPassword(auth, email, password);
        console.log("Authenticated User:", user);

        // Fetch user role from Firestore
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (!userDocSnap.exists()) {
            console.error("No document found for UID:", user.uid);
            throw { code: "auth/no-user-data" };
        }

        const userData = userDocSnap.data();
        console.log("Firestore Data:", userData);

        if (!userData.role) {
            console.error("User role is missing in Firestore!");
            throw { code: "auth/no-user-data" };
        }

        const { role } = userData;
        console.log("User Role:", role);

        // Redirect user based on role
        switch (role) {
            case "admin":
                goto('/admin');
                break;
            case "user":
                goto('/user/order-templates');
                break;
            default:
                throw { code: "auth/unauthorized" };
        }

    } catch (error: any) {
        console.error("Authentication error:", error);

        const errorMessages: { [key: string]: string } = {
            "auth/invalid-email": "Please enter a valid email address.",
            "auth/user-disabled": "This account has been disabled.",
            "auth/user-not-found": "No account found with this email.",
            "auth/wrong-password": "Incorrect password.",
            "auth/email-not-verified": "Please verify your email before logging in.",
            "auth/missing-fields": "Email and password are required.",
            "auth/no-user-data": "User data not found in Firestore.",
            "auth/unauthorized": "Unauthorized access. Contact admin.",
            "default": "Failed to login. Please try again.",
        };

        errorMessage = errorMessages[error.code as string] || errorMessages["default"];

    } finally {
        isLoading = false;
    }
}



  </script>
  
  <main class="min-h-screen flex items-center justify-center py-6 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-4 bg-white rounded-xl shadow-lg p-6 sm:p-8">
      <!-- Fixed Logo/Brand section -->
      <div class="text-center space-y-1">
        <img 
          class="h-14 w-auto mx-auto" 
          src="images/logo.png" 
          alt="Logo" 
        />
        <h2 class="text-2xl sm:text-3xl font-bold text-gray-900">Welcome Back</h2>
        <p class="text-sm text-gray-600">Please sign in to continue</p>
      </div>
  
      <form on:submit|preventDefault={loginUser} class="space-y-4">
        <!-- Email Input -->
        <div class="space-y-1">
          <Label class="block text-sm font-medium text-gray-700" for="email">
            Email Address
          </Label>
          <div class="relative">
            <EnvelopeSolid class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              id="email"
              type="email"
              bind:value={email}
              class="pl-10"
              placeholder="name@example.com"
              required
            />
          </div>
        </div>
  
        <!-- Password Input -->
        <div class="space-y-1">
          <Label class="block text-sm font-medium text-gray-700" for="password">
            Password
          </Label>
          <div class="relative">
            <LockSolid class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              id="password"
              type="password"
              bind:value={password}
              class="pl-10"
              placeholder="••••••••"
              required
            />
          </div>
        </div>
  
        <!-- Error Message -->
        {#if errorMessage}
          <div class="bg-red-50 border-l-4 border-red-500 p-4">
            <p class="text-red-700 text-sm">{errorMessage}</p>
          </div>
        {/if}
  
        <!-- Remember Me & Forgot Password -->
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <Checkbox bind:checked={rememberMe} id="remember-me">
              <span class="text-sm text-gray-700">Remember me</span>
            </Checkbox>
          </div>
        </div>
  
        <!-- Login Button -->
        <Button
          type="submit"
          class="w-full"
          color="red"
          disabled={isLoading}
        >
          {#if isLoading}
            <div class="flex items-center justify-center">
              <div class="animate-spin h-5 w-5 mr-3 border-2 border-white border-t-transparent rounded-full"></div>
              Signing in...
            </div>
          {:else}
            Sign in
          {/if}
        </Button>
  
        <!-- Register Link -->
        <div class="text-center pt-2">
          <span class="text-sm text-gray-600">Don't have an account?</span>
          <a href="/register" class="ml-1 text-sm font-medium text-blue-600 hover:text-blue-500">
            Create one now
          </a>
        </div>
      </form>
    </div>
  </main>
  
  <style>
     /*  :global(body) {
      background-color: #ff2a043e;
    }
  
  Optional: Style the input focus states */
    :global(.input:focus) {
      border-color: #800000;
      box-shadow: 0 0 0 1px #800000;
    }
  
    /* Optional: Style the button hover state */
    :global(button:hover) {
      opacity: 0.9;
    }
  </style>
