import { useState, useEffect } from 'react'

export interface LinkMetadata {
    title?: string
    description?: string
    image?: string
    domain?: string
}

interface UseLinkMetadataResult {
    metadata: LinkMetadata | null
    isLoading: boolean
    error: Error | null
}

// Mock data for demo purposes since we can't scrape real OG tags in browser
const MOCK_METADATA: Record<string, LinkMetadata> = {
    'google.com': {
        title: 'Google',
        description: 'Search the world\'s information, including webpages, images, videos and more.',
        image: 'https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png',
        domain: 'google.com'
    },
    'github.com': {
        title: 'GitHub: Let\'s build from here',
        description: 'GitHub is where over 100 million developers shape the future of software, together.',
        image: 'https://github.githubassets.com/images/modules/site/social-cards/github-social.png',
        domain: 'github.com'
    },
    'youtube.com': {
        title: 'YouTube',
        description: 'Enjoy the videos and music you love, upload original content, and share it all with friends, family, and the world on YouTube.',
        image: 'https://www.youtube.com/img/desktop/yt_1200.png',
        domain: 'youtube.com'
    },
    'openai.com': {
        title: 'OpenAI',
        description: 'OpenAI is an AI research and deployment company. Our mission is to ensure that artificial general intelligence benefits all of humanity.',
        image: 'https://openai.com/content/images/2022/05/openai-avatar.png',
        domain: 'openai.com'
    }
}

export function useLinkMetadata(url: string | undefined): UseLinkMetadataResult {
    const [metadata, setMetadata] = useState<LinkMetadata | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<Error | null>(null)

    useEffect(() => {
        if (!url) {
            setMetadata(null)
            return
        }

        const fetchMetadata = async () => {
            setIsLoading(true)
            setError(null)

            try {
                // Simulate network delay
                await new Promise(resolve => setTimeout(resolve, 500))

                // Check if we have mock data for this domain
                const domain = new URL(url).hostname.replace('www.', '')
                const mockData = Object.entries(MOCK_METADATA).find(([key]) => domain.includes(key))

                if (mockData) {
                    setMetadata(mockData[1])
                } else {
                    // Fallback for unknown sites
                    setMetadata({
                        title: domain,
                        description: url,
                        domain: domain
                    })
                }
            } catch (err) {
                setError(err as Error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchMetadata()
    }, [url])

    return { metadata, isLoading, error }
}
