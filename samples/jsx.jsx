import React, { useState } from 'react'

export default function () {
    const [count, setCount] = useState(0)

    return (
        <>
            <main>
                <h1>IntelliJ IDEA</h1>
                <img border="0" height="12" src="images/hg.gif" width="18" />
                What is IntelliJ&nbsp;IDEA? &#x00B7; &Alpha;
                <button onClick={() => setCount(count + 1)}>Click me</button>
                <div>{count}</div>
            </main>
        </>
    )
}
