#!/usr/bin/env deno run --allow-net --allow-read
import whois from 'npm:whois@2.14.0'

const urls = Deno.readTextFileSync('resources/url-allowlist.txt')
    .split('\n')
    .filter((content) => content.length > 0)

const expiryWarning = new Date()
expiryWarning.setDate(expiryWarning.getDate() + 180)

let i = 1

for (const url of urls) {
    whois.lookup(url, (err: any, data: string) => {
        if (err) {
            console.error(`error on ${url}:`, err)
            return
        } else {
            if (data.length === 0) {
                console.error(`no data on ${url}`)
                return
            }

            const d = data.match(/expir(ation|y) date: (.*)/gi)
            console.log(d)
            const date = new Date(d ? d[1] : '1970-01-01')

            if (date < expiryWarning) {
                console.warn(`WARN: ${url} expires on ${date}`)
            }
            console.log(
                'Processed',
                i++,
                'of',
                urls.length,
                'domains (',
                url,
                ')'
            )
        }
    })
}
