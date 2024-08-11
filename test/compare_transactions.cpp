#include <iostream>
#include <fstream>
#include <unordered_set>
#include <string>

// Function to read transactions from a file into an unordered_set
std::unordered_set<std::string> readTransactions(const std::string& filePath) {
    std::unordered_set<std::string> transactions;
    std::ifstream file(filePath);
    std::string line;

    if (file.is_open()) {
        while (std::getline(file, line)) {
            transactions.insert(line);
        }
        file.close();
    } else {
        std::cerr << "Unable to open file: " << filePath << std::endl;
    }

    return transactions;
}

// Function to find common transactions and print them with their count
void findCommonTransactions(const std::string& mempoolFile, const std::string& privateFile) {
    std::unordered_set<std::string> mempoolTransactions = readTransactions(mempoolFile);
    std::unordered_set<std::string> privateTransactions = readTransactions(privateFile);

    std::unordered_set<std::string> commonTransactions;
    for (const auto& tx : mempoolTransactions) {
        if (privateTransactions.find(tx) != privateTransactions.end()) {
            commonTransactions.insert(tx);
        }
    }

    // Print the common transactions
    std::cout << "Mempol Data Length: " <<mempoolTransactions.size() << std::endl;
    std::cout << "Priv Data Length: " <<privateTransactions.size() << std::endl;

    std::cout << "Number of common transactions: " << commonTransactions.size() << std::endl;
    for (const auto& tx : commonTransactions) {
        std::cout << tx << std::endl;
    }
}

int main() {
    const std::string mempoolFile = "mempool_transactions.txt";
    const std::string privateFile = "private_transactions.txt";

    findCommonTransactions(mempoolFile, privateFile);

    return 0;
}
