import { UserId } from './user-id.vo';

describe('UserId', () => {
  const validUuid = '3f2504e0-4f89-41d3-9a0c-0305e82c3301';

  it('creates a value object from a valid UUID', () => {
    const id = UserId.create(validUuid);

    expect(id.value).toBe(validUuid);
    expect(id.toString()).toBe(validUuid);
  });

  it('rejects an empty value', () => {
    expect(() => UserId.create('')).toThrow('ID_CANNOT_BE_EMPTY');
  });

  it('rejects a non-UUID value', () => {
    expect(() => UserId.create('not-a-uuid')).toThrow(/INVALID_USER_ID_FORMAT/);
  });

  it('treats two ids with the same value as equal', () => {
    expect(UserId.create(validUuid).equals(UserId.create(validUuid))).toBe(
      true,
    );
  });

  it('treats ids with different values as not equal', () => {
    const other = '00000000-0000-4000-8000-000000000000';
    expect(UserId.create(validUuid).equals(UserId.create(other))).toBe(false);
  });

  it('is not equal to undefined', () => {
    expect(UserId.create(validUuid).equals(undefined)).toBe(false);
  });
});
