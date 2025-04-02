<script lang="ts">
  import { getFirestore, collection, addDoc, setDoc, doc } from 'firebase/firestore';
  import { firebaseConfig } from "$lib/firebaseConfig";
  import { initializeApp, getApps, getApp } from "firebase/app";
  import { createUserWithEmailAndPassword } from 'firebase/auth';
  import { getAuth } from 'firebase/auth';
  import { Button, Label, Input, Select, Toast } from 'flowbite-svelte'; // Select might not be needed anymore if unused elsewhere
  import { CheckCircleSolid, EnvelopeSolid, LockSolid, UserSolid } from 'flowbite-svelte-icons';
  import { goto } from '$app/navigation';

  // Firebase initialization
  const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  const db = getFirestore(app);
  const auth = getAuth(app);

  let email = "";
  let password = "";
  let confirmPassword = "";
  let username = "";
  // --- Role is now fixed ---
  const role = "user"; 
  let errorMessage = "";
  let showToast = false;

  function isEmailValid(email: string) {
    const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return regex.test(email);
  }

  async function registerUser() {
    if (!isEmailValid(email)) {
      errorMessage = "Please enter a valid email address.";
      return;
    }

    if (password !== confirmPassword) {
      errorMessage = "Passwords do not match!";
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Add user with the fixed 'user' role to Firestore
      await setDoc(doc(db, "users", user.uid), {
        email,
        username,
        role, // This will always be 'user' now
        createdAt: new Date(),
        uid: user.uid, // Ensure we store uid
      });

      // Reset form fields
      email = "";
      password = "";
      confirmPassword = "";
      username = "";
      // No need to reset 'role' as it's constant
      errorMessage = "";
      showToast = true;

      setTimeout(() => {
        showToast = false;
        goto('/'); // Redirect after success
      }, 3000);

    } catch (error: unknown) {
      console.error("Error during registration:", error);

      if (error instanceof Error) {
        if (error.message.includes('email-already-in-use')) {
          errorMessage = "This email is already in use. Please use a different email.";
        } else if (error.message.includes('weak-password')) {
          errorMessage = "Password is too weak. Please use a stronger password.";
        } else {
          errorMessage = error.message; // Show other Firebase auth errors
        }
      } else {
        errorMessage = "An unknown error occurred.";
      }
    }
  }
</script>

<main class="min-h-screen flex items-center justify-center py-6 px-4 sm:px-6 lg:px-8">
<div class="max-w-md w-full space-y-4 bg-white rounded-xl shadow-lg p-6 sm:p-8">
  <div class="text-center space-y-1">
    <img class="h-14 w-auto mx-auto" src="images/logo.png" alt="Logo" />
    <h2 class="text-2xl sm:text-3xl font-bold text-gray-900">Create Account</h2>
    <p class="text-sm text-gray-600">Please fill in the details below</p>
  </div>

  <form on:submit|preventDefault={registerUser} class="space-y-4">
    <!-- Email -->
    <div class="space-y-1">
      <Label for="email">Email Address</Label>
      <div class="relative">
        <EnvelopeSolid class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input id="email" type="email" bind:value={email} class="pl-10" placeholder="name@example.com" required />
      </div>
    </div>

    <!-- Username -->
    <div class="space-y-1">
      <Label for="username">Username</Label>
      <div class="relative">
        <UserSolid class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input id="username" type="text" bind:value={username} class="pl-10" placeholder="Enter your username" required />
      </div>
    </div>

    <!-- Role Selection REMOVED -->
    <!--
    <div class="space-y-1">
      <Label for="role">Register As</Label>
      <Select id="role" bind:value={role} required>
        <option value="user">User</option>
        <option value="admin">Admin</option>
      </Select>
    </div>
    -->

    <!-- Password -->
    <div class="space-y-1">
      <Label for="password">Password</Label>
      <div class="relative">
        <LockSolid class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input id="password" type="password" bind:value={password} class="pl-10" placeholder="••••••••" required />
      </div>
    </div>

    <!-- Confirm Password -->
    <div class="space-y-1">
      <Label for="confirmPassword">Confirm Password</Label>
      <div class="relative">
        <LockSolid class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input id="confirmPassword" type="password" bind:value={confirmPassword} class="pl-10" placeholder="••••••••" required />
      </div>
    </div>

    <!-- Error Message -->
    {#if errorMessage}
      <div class="bg-red-50 border-l-4 border-red-500 p-4">
        <p class="text-red-700 text-sm">{errorMessage}</p>
      </div>
    {/if}

    <!-- Register Button -->
    <Button type="submit" class="w-full bg-blue-600 hover:bg-blue-700 text-white">Create Account</Button>

    <!-- Login Link -->
    <div class="text-center pt-2">
      <span class="text-sm text-gray-600">Already have an account?</span>
      <a href="/login" class="ml-1 text-sm font-medium text-blue-600 hover:text-blue-500">Sign in</a>
    </div>
  </form>
</div>
</main>

{#if showToast}
<div class="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
  <Toast color="green">
    <svelte:fragment slot="icon">
      <CheckCircleSolid class="w-5 h-5" />
    </svelte:fragment>
    Registered successfully!
  </Toast>
</div>
{/if}

<style>
:global(body) {
  background-color: #faf1e8;
}
</style>