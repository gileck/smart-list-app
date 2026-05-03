export function assertNever(value: never): never {
    throw new Error(`Unhandled discriminated union variant: ${String(value)}`);
}
