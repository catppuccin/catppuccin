<script>
    import { applyAction, enhance } from '$app/forms'
    import Names from '$lib/components/names.svelte'
    export let data
    export let form
    console.log('form: ', form)
    const { names } = data
</script>

<h1>Some form</h1>

<form
    method="POST"
    use:enhance={({ form }) => {
        return async ({ update }) => {
            update()
        }
    }}
    action="?/create"
>
    <input
        type="text"
        placeholder="Type here"
        class="input input-bordered w-full max-w-xs"
        name="myText"
    />
</form>

<br />

<Names namesData={names} />
