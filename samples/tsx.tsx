import React, { useState } from 'react'

const Component = (): JSX.Element => {
    const [count, setCount] = useState<number>(0)

    return (
        <>
            <main>
                <h1>IntelliJ IDEA</h1>
                <img height="12" src="images/hg.gif" width="18" />
                What is IntelliJ&nbsp;IDEA? &#x00B7; &Alpha;
                <button onClick={() => setCount(count + 1)}>Click me</button>
                <div>{count}</div>
            </main>
        </>
    )
}

export default Component
