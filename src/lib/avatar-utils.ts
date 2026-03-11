// src/lib/avatar-utils.ts

export interface AvatarConfig {
    style: string;
    seed: string;
    bgColor: string;
    isUrl: boolean;
    traits: Record<string, string | number | boolean | (string | number)[]>;
}

/**
 * Parses a database avatar string into an AvatarConfig object.
 * Supports legacy formats (micah:seed:color) and the new builder format.
 */
export function parseAvatarConfig(dbString?: string | null, defaultUserId?: string): AvatarConfig {
    const defaultSeed = defaultUserId || Math.random().toString(16).substring(2, 10);
    const defaultConfig: AvatarConfig = {
        style: 'initials',
        seed: defaultSeed,
        bgColor: 'transparent',
        isUrl: false,
        traits: {}
    };

    if (!dbString) return defaultConfig;

    // 1. Check if it's an HTTP URL
    if (dbString.startsWith('http://') || dbString.startsWith('https://')) {
        return {
            ...defaultConfig,
            isUrl: true,
            style: 'url',
            seed: dbString, // Store URL in seed for easy access
        };
    }

    // 2. Check for the new builder format (e.g. "builder|seed123|#3b82f6|hair=short,eyes=happy")
    if (dbString.startsWith('builder|')) {
        const parts = dbString.split('|');
        if (parts.length >= 3) {
            const traitsArray = parts[3] ? parts[3].split(',') : [];
            const traitsObj: Record<string, string> = {};

            traitsArray.forEach(pair => {
                const [key, value] = pair.split('=');
                if (key && value) traitsObj[key] = value;
            });

            return {
                ...defaultConfig,
                style: 'builder',
                seed: parts[1] || defaultSeed,
                bgColor: parts[2] || 'transparent',
                traits: traitsObj
            };
        }
    }

    // 3. Fallback to Legacy Format (e.g. "micah:seed123:#3b82f6" or just "initials")
    const parts = dbString.includes(':') ? dbString.split(':') : [dbString];

    return {
        ...defaultConfig,
        style: parts[0] || 'initials',
        // Special rule for initials: legacy might have random hash in seed, 
        // but we'll try to extract real initials if possible later in the UI.
        seed: parts[1] || defaultSeed,
        bgColor: parts[2] || 'transparent'
    };
}

/**
 * Stringifies an AvatarConfig object back into the database format.
 */
export function stringifyAvatarConfig(config: AvatarConfig): string {
    if (config.isUrl) {
        return config.seed; // seed contains the raw URL
    }

    if (config.style === 'builder') {
        const traitStrings = Object.entries(config.traits)
            // Filter out empty/undefined undefined traits
            .filter(([_, val]) => val !== undefined && val !== '')
            .map(([key, val]) => `${key}=${val}`);

        const traitPart = traitStrings.length > 0 ? `|${traitStrings.join(',')}` : '';
        return `builder|${config.seed}|${config.bgColor}${traitPart}`;
    }

    // Save legacy/preset formats exactly as they were
    return `${config.style}:${config.seed}:${config.bgColor}`;
}

/**
 * Extracts sensible initials from a full name (e.g. "Max Mustermann" -> "MM")
 */
export function getInitialsFromName(name?: string | null): string {
    if (!name?.trim()) return 'U'; // Unknown

    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) {
        return parts[0].substring(0, 2).toUpperCase();
    }

    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
