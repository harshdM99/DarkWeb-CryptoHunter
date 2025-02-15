from hashlib import sha256

class BitcoinAddressExtractor:
    digits58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'

    @staticmethod
    def decode_base58(bc, length):
        n = 0
        for char in bc:
            n = n * 58 + BitcoinAddressExtractor.digits58.index(char)
        return n.to_bytes(length, 'big')

    @staticmethod
    def check_bc(bc):
        '''
            Check if the input text is a valid bitcoin or not
        '''
        try:
            bcbytes = BitcoinAddressExtractor.decode_base58(bc, 25)
            # Verify checksum
            return bcbytes[-4:] == sha256(sha256(bcbytes[:-4]).digest()).digest()[:4]
        except Exception:
            return False

    @staticmethod
    def extract_addresses(text):
        addresses = []
        i = 0
        while i <= len(text) - 26:
            # Check if the starting character is '1' or '3'
            if text[i] == '1' or text[i] == '3':
                # Try lengths from 26 to 35 (Bitcoin address range)
                for win_len in range(26, 36):
                    potential_address = text[i:i+win_len]
                    if BitcoinAddressExtractor.check_bc(potential_address):
                        addresses.append(potential_address)
                        break
            i += 1
        return addresses