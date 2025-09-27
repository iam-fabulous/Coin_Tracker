import { SuiClient, getFullnodeUrl } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { Ed25519Keypair } from '@mysten/sui.js/keypairs/ed25519';

import { decodeSuiPrivateKey } from '@mysten/sui.js/cryptography';

// Configuration constants
const PACKAGE_ID = '0x6129888558fbd3bebe25825cdb5d354c2947d542fa01c3e4a1850cdd94ef714b';
const LEDGER_OBJECT_ID = '0x41960f5f482b71bb75eb65c6857dae81595cef1caae7f70d35e834cb9634bdb5';
const CLOCK_OBJECT_ID = '0x0000000000000000000000000000000000000000000000000000000000000006';

const { secretKey } = decodeSuiPrivateKey(
  'suiprivkey1qr5s3ka0kt5uptvqzvfnulkug4wd2n22rsyrf50frhw4qta4gv4dsjtqm5p'
);

// TypeScript interfaces
export interface TransactionEntry {
  company_name: string;
  username: string;
  amount: number;
  transaction_type: string;
  transaction_address: string;
  status: string;
  date: number;
  transaction_digest: string;
}

export interface LedgerResponse {
  success: boolean;
  data?: TransactionEntry | number;
  error?: string;
  transactionDigest?: string;
}

export interface GetEntriesResponse {
  success: boolean;
  entries?: TransactionEntry[];
  totalCount?: number;
  error?: string;
}

// Type for Sui return values
type SuiReturnValue = [number[], number[]];
type SuiValue = string | number | number[] | SuiReturnValue | undefined;
type SuiInspectionResult = {
  effects: {
    status: {
      status: string;
      error?: string;
    };
  };
  results?: Array<{
    returnValues?: SuiValue[];
  }>;
};

// Initialize Sui client and keypair
const suiClient = new SuiClient({
  url: getFullnodeUrl('testnet'), // Change to 'mainnet' for production
});

const keypair = Ed25519Keypair.fromSecretKey(secretKey);

/**
 * Add a new entry to the ledger after a transaction
 * @param entryData - The transaction entry data
 * @returns Promise with transaction result and digest
 */
export async function addLedgerEntry(entryData: {
  company_name: string;
  username: string;
  amount: number;
  transaction_type: string;
  transaction_address: string;
  status: string;
  date?: number; // Optional, will use current timestamp if not provided
}): Promise<LedgerResponse> {
  try {
    const txb = new TransactionBlock();
    
    // Convert strings to vector<u8> format for Move
    const companyNameBytes = Array.from(new TextEncoder().encode(entryData.company_name));
    const usernameBytes = Array.from(new TextEncoder().encode(entryData.username));
    const transactionTypeBytes = Array.from(new TextEncoder().encode(entryData.transaction_type));
    const statusBytes = Array.from(new TextEncoder().encode(entryData.status));
    
    // Debug logging for amount being stored
    console.log('Storing amount in blockchain:', entryData.amount);
    console.log('Amount type:', typeof entryData.amount);

    // Add the move call to add_entry
    txb.moveCall({
      target: `${PACKAGE_ID}::backup_ledger::add_entry`,
      arguments: [
        txb.object(LEDGER_OBJECT_ID), // ledger
        txb.pure(companyNameBytes), // company_name
        txb.pure(usernameBytes), // username
        txb.pure(entryData.amount), // amount
        txb.pure(transactionTypeBytes), // transaction_type
        txb.pure(entryData.transaction_address), // transaction_address
        txb.pure(statusBytes), // status
        txb.pure(entryData.date || 0), // date (0 means use current timestamp)
        txb.object(CLOCK_OBJECT_ID), // clock
      ],
    });

    // Execute the transaction
    const result = await suiClient.signAndExecuteTransactionBlock({
      signer: keypair,
      transactionBlock: txb,
      options: {
        showEffects: true,
        showEvents: true,
        showObjectChanges: true,
      },
    });

    // Check if transaction was successful
    if (result.effects?.status?.status === 'success') {
      return {
        success: true,
        data: result as unknown as TransactionEntry,
        transactionDigest: result.digest,
      };
    } else {
      return {
        success: false,
        error: `Transaction failed: ${result.effects?.status?.error}`,
      };
    }
  } catch (error) {
    console.error('Error adding ledger entry:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Get a single ledger entry by index
 * @param index - The index of the entry to retrieve
 * @returns Promise with the entry data
 */
export async function getLedgerEntry(index: number): Promise<LedgerResponse> {
  try {
    console.log(`Getting ledger entry at index: ${index}`);
    const txb = new TransactionBlock();
    
    // Correct way to call moveCall - no await, no assignment
    txb.moveCall({
      target: `${PACKAGE_ID}::backup_ledger::get_entry`,
      arguments: [
        txb.object(LEDGER_OBJECT_ID),
        txb.pure(index, 'u64'), // Specify the type
      ],
    });

    // This is a view function, so we need to use devInspectTransactionBlock
    const inspectionResult = await suiClient.devInspectTransactionBlock({
      sender: keypair.getPublicKey().toSuiAddress(),
      transactionBlock: txb,
    }) as SuiInspectionResult;

    console.log(`Inspection result for index ${index}:`, JSON.stringify(inspectionResult, null, 2));

    if (inspectionResult.effects.status.status === 'success' && inspectionResult.results) {
      const result = inspectionResult.results[0];
      console.log(`Raw result for index ${index}:`, result);
      
      if (result && result.returnValues && result.returnValues.length >= 8) {
        try {
          const returnValues = result.returnValues;
          console.log(`Return values for index ${index}:`, returnValues);

          // Helper function to safely decode bytes
          const safeDecodeBytes = (data: SuiValue): string => {
            try {
              if (Array.isArray(data) && data.length > 0) {
                // Handle nested array format
                const bytes = Array.isArray(data[0]) ? data[0] : data;
                // Convert to proper Uint8Array format for Sui return values
                const uint8Array = Array.isArray(bytes) ? new Uint8Array(bytes as number[]) : new Uint8Array([bytes as number]);
                return new TextDecoder().decode(uint8Array);
              }
              return '';
            } catch (e) {
              console.warn('Failed to decode bytes:', data, e);
              return '';
            }
          };

          // Type for Sui number-like values (to avoid 'any' type)
          type SuiNumberLike = string | number | number[] | SuiNumberLike[];

          // Helper function to safely decode a number from Sui getEntry response
          const safeDecodeNumber = (data: SuiNumberLike): number => {
            if (data == null) return 0;

            // If it's a string, Sui often returns big numbers as strings
            if (typeof data === 'string') {
              const bigIntValue = BigInt(data);
              // Convert to number if it's within safe integer range
              return Number(bigIntValue);
            }

            // If it's a number, return as is
            if (typeof data === 'number') {
              return data;
            }

            // If it's an array, handle Sui's various array formats
            if (Array.isArray(data)) {
              // Check if it's a byte array (all elements are numbers)
              if (data.length > 0 && data.every((x) => typeof x === 'number')) {
                // Convert little-endian byte array to BigInt, then to number
                const bigIntValue = data.reduce(
                  (acc, byte, i) => acc + BigInt(byte as number) * (BigInt(1) << BigInt(8 * i)),
                  BigInt(0)
                );
                return Number(bigIntValue);
              }

              // If it's a nested array, try to decode the first element
              if (data.length > 0 && data[0] !== undefined) {
                return safeDecodeNumber(data[0] as SuiNumberLike);
              }
            }

            // Fallback
            return 0;
          };


          // Helper function to safely decode address
          const safeDecodeAddress = (data: SuiValue): string => {
            try {
              if (Array.isArray(data) && data.length > 0) {
                const bytes = Array.isArray(data[0]) ? data[0] : data;
                if (Array.isArray(bytes) && bytes.length === 32) {
                  return `0x${bytes.map((b: number) => b.toString(16).padStart(2, '0')).join('')}`;
                }
              }
              return '';
            } catch (e) {
              console.warn('Failed to decode address:', data, e);
              return '';
            }
          };

          // Parse each field safely
          const [companyName, username, amount, transactionType, transactionAddress, status, date, transactionDigest] = returnValues;

          // Debug logging for amount field
          console.log(`Raw amount data for index ${index}:`, amount);
          const parsedAmount = safeDecodeNumber(amount as SuiNumberLike);
          console.log(`Parsed amount for index ${index}:`, parsedAmount);

          const entry: TransactionEntry = {
            company_name: safeDecodeBytes(companyName),
            username: safeDecodeBytes(username),
            amount: parsedAmount,
            transaction_type: safeDecodeBytes(transactionType),
            transaction_address: safeDecodeAddress(transactionAddress),
            status: safeDecodeBytes(status),
            date: safeDecodeNumber(date as SuiNumberLike),
            transaction_digest: safeDecodeBytes(transactionDigest),
          };

          console.log(`Parsed entry for index ${index}:`, entry);

          return {
            success: true,
            data: entry,
          };
        } catch (parseError) {
          console.error(`Error parsing entry at index ${index}:`, parseError);
          return {
            success: false,
            error: `Failed to parse entry data: ${parseError instanceof Error ? parseError.message : 'Unknown parse error'}`,
          };
        }
      } else {
        console.log(`No return values or insufficient return values for index ${index}`);
        return {
          success: false,
          error: 'No return values or insufficient return values',
        };
      }
    } else {
      console.log(`Inspection failed for index ${index}:`, inspectionResult.effects.status);
      return {
        success: false,
        error: `Inspection failed: ${inspectionResult.effects.status.error || 'Unknown error'}`,
      };
    }
  } catch (error) {
    console.error(`Error getting ledger entry at index ${index}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Get the total count of ledger entries
 * @returns Promise with the count
 */
export async function getLedgerCount(): Promise<LedgerResponse> {
  try {
    console.log('Getting ledger count...');
    const txb = new TransactionBlock();
    
    // Correct way to call moveCall
    txb.moveCall({
      target: `${PACKAGE_ID}::backup_ledger::get_count`,
      arguments: [txb.object(LEDGER_OBJECT_ID)],
    });

    const inspectionResult = await suiClient.devInspectTransactionBlock({
      sender: keypair.getPublicKey().toSuiAddress(),
      transactionBlock: txb,
    }) as SuiInspectionResult;

    console.log('Count inspection result:', JSON.stringify(inspectionResult, null, 2));

    if (inspectionResult.effects.status.status === 'success' && inspectionResult.results) {
      const result = inspectionResult.results[0];
      console.log('Count raw result:', result);
      
      if (result && result.returnValues && result.returnValues.length > 0) {
        try {
          const returnValue = result.returnValues[0];
          console.log('Count return value:', returnValue);
          
          let count = 0;
          
          // Handle different possible return formats
          if (Array.isArray(returnValue) && returnValue.length > 0) {
            // If it's nested array format
            const value = Array.isArray(returnValue[0]) ? returnValue[0][0] : returnValue[0];
            count = Number(value) || 0;
          } else if (typeof returnValue === 'number') {
            count = returnValue;
          } else if (typeof returnValue === 'string') {
            count = parseInt(returnValue) || 0;
          }
          
          console.log('Parsed count:', count);
          
          return {
            success: true,
            data: count,
          };
        } catch (parseError) {
          console.error('Error parsing count:', parseError);
          return {
            success: false,
            error: `Failed to parse count: ${parseError instanceof Error ? parseError.message : 'Unknown parse error'}`,
          };
        }
      } else {
        console.log('No return values for count');
        return {
          success: false,
          error: 'No return values',
        };
      }
    } else {
      console.log('Count inspection failed:', inspectionResult.effects.status);
      return {
        success: false,
        error: `Count inspection failed: ${inspectionResult.effects.status.error || 'Unknown error'}`,
      };
    }
  } catch (error) {
    console.error('Error getting ledger count:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Get all ledger entries with most recent first
 * @param limit - Optional limit for number of entries to fetch (default: all)
 * @returns Promise with all entries sorted by most recent first
 */
export async function getAllLedgerEntries(limit?: number): Promise<GetEntriesResponse> {
  try {
    // First get the total count
    const countResponse = await getLedgerCount();
    if (!countResponse.success || typeof countResponse.data !== 'number') {
      return {
        success: false,
        error: 'Failed to get ledger count',
      };
    }

    const totalCount = countResponse.data;
    if (totalCount === 0) {
      return {
        success: true,
        entries: [],
        totalCount: 0,
      };
    }

    // Determine how many entries to fetch
    const entriesToFetch = limit ? Math.min(limit, totalCount) : totalCount;
    const entries: TransactionEntry[] = [];

    // Fetch entries in reverse order (most recent first)
    const fetchPromises: Promise<LedgerResponse>[] = [];
    for (let i = totalCount - 1; i >= Math.max(0, totalCount - entriesToFetch); i--) {
      fetchPromises.push(getLedgerEntry(i));
    }

    // Execute all fetches concurrently
    const results = await Promise.allSettled(fetchPromises);

    // Process results
    for (const result of results) {
      if (result.status === 'fulfilled' && result.value.success) {
        entries.push(result.value.data as TransactionEntry);
      }
    }

    return {
      success: true,
      entries,
      totalCount,
    };
  } catch (error) {
    console.error('Error getting all ledger entries:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Get recent ledger entries (last N entries)
 * @param count - Number of recent entries to fetch (default: 10)
 * @returns Promise with recent entries
 */
export async function getRecentLedgerEntries(count: number = 10): Promise<GetEntriesResponse> {
  return getAllLedgerEntries(count);
}

/**
 * Listen to EntryAdded events for real-time updates
 * @param callback - Callback function to handle new entries
 * @returns Subscription that can be used to unsubscribe
 */
export async function subscribeToLedgerEvents(
  callback: (entry: Record<string, unknown>) => void
): Promise<() => void> {
  try {
    // Subscribe to events from the package
    const unsubscribe = await suiClient.subscribeEvent({
      filter: {
        Package: PACKAGE_ID,
      },
      onMessage: (event) => {
        if (event.type.includes('EntryAdded')) {
          // Parse the event data
          const eventData = event.parsedJson;
          if (eventData) {
            callback(eventData as Record<string, unknown>);
          }
        }
      },
    });

    return unsubscribe;
  } catch (error) {
    console.error('Error subscribing to ledger events:', error);
    return () => {}; // Return empty unsubscribe function
  }
}

/**
 * Helper function to format timestamp for display
 * @param timestamp - Unix timestamp in milliseconds
 * @returns Formatted date string
 */
export function formatTimestamp(timestamp: number): string {
  return new Date(timestamp).toLocaleString();
}

/**
 * Helper function to validate entry data before adding
 * @param entryData - Entry data to validate
 * @returns Validation result
 */
export function validateEntryData(entryData: {
  company_name: string;
  username: string;
  amount: number;
  transaction_type: string;
  transaction_address: string;
  status: string;
}): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!entryData.company_name.trim()) {
    errors.push('Company name is required');
  }
  if (!entryData.username.trim()) {
    errors.push('Username is required');
  }
  if (entryData.amount < 0) {
    errors.push('Amount must be non-negative');
  }
  if (!entryData.transaction_type.trim()) {
    errors.push('Transaction type is required');
  }
  if (!entryData.transaction_address.trim()) {
    errors.push('Transaction address is required');
  }
  if (!entryData.status.trim()) {
    errors.push('Status is required');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// Export constants for use in components
export const LEDGER_CONSTANTS = {
  PACKAGE_ID,
  LEDGER_OBJECT_ID,
  CLOCK_OBJECT_ID,
};
