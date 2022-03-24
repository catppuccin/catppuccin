document.addEventListener("DOMContentLoaded", () =>
    document.querySelectorAll("pre.msh .js-copy").forEach((copy) =>
        copy.addEventListener("click", (e) =>
            e.preventDefault()

            content = copy.nextElementSibling
            range = document.createRange()
            range.selectNode(content)

            window.getSelection().addRange(range)

            try
                successful = document.execCommand("copy")
                copy.innerHTML = "Copied!"

                setTimeout =>
                    copy.innerHTML = "Copy"
                , 1500

                msg = successful ? "successful" : "unsuccessful"
                console.log({ msg })

            catch error
                console.log("Oops, unable to copy...")

            window.getSelection().removeAllRanges()
        )
    )

    document.querySelectorAll("pre.msh code[data-language='html'] span.line").forEach((line) =>
        content = line.innerHTML
        content = content.replaceAll(/(&lt;(\/?))(.+?(?=&gt;))(&gt;)/g, "$1<span class='c2'>$3</span>$4")

        line.innerHTML = content
        pink = line.querySelector(".c2")

        if pink != null
            content = pink.innerHTML.split(" ")
            content = content.map((part, index) =>
                if index > 0
                    if part.includes("=")
                        part = part.replaceAll(/(.+?)(".*)/g, "<span class='c3'>$1</span><span class='c4'>$2</span>")
                    else
                        part = part.replaceAll(/(.*\S)/g, "<span class='c3'>$1</span>")
                part
            ).join(" ")
            pink.innerHTML = content
        return
    )

    document.querySelectorAll("pre.msh code[data-language='css'] span.line").forEach((line) =>
        content = line.innerHTML

        if line.dataset.indent
            content = content.split(/:/g).map((part, index) =>
                if index == 0
                    part.replace(/(.*)/g, "<span class='c7'>$1</span>")
                else
                    part = part.replaceAll(/(\S.+?(?=\s|;))/g, "<span class='c6'>$1</span>")
                    part = part.replaceAll(/(".+?(?=,|\s|;))/g, "<span class='c4'>$1</span>")
                    part = part.replaceAll(/(url\(.+?(?=\s|;))/g, "<span class='c3'>$1</span>")
                    part.replaceAll(/\((.+?(?=\)))/g, "(<span class='c4'>$1</span>")
            ).join(":")
        else
            content = content.replaceAll(/(.+?(?=,|\s|{}))/g, "<span class='c2'>$1</span>")
            content = content.replaceAll(/((\.|:).+?(?=\s))/g, "<span class='c3'>$1</span>")

        line.innerHTML = content
        return
    )
)
