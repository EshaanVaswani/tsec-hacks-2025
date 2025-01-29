pragma solidity ^0.8.0;

contract LegalDocumentManagement {
    struct Document {
        string ipfsHash;
        uint256 timestamp;
        address submitter;
        string docType;
        bool isVerified;
    }
    
    mapping(bytes32 => Document) public documents;
    
    event DocumentSubmitted(bytes32 indexed docId, string ipfsHash, address submitter);
    event DocumentVerified(bytes32 indexed docId, address verifier);
    
    function submitDocument(
        string memory _ipfsHash,
        string memory _docType
    ) public returns (bytes32) {
        bytes32 docId = keccak256(abi.encodePacked(_ipfsHash, msg.sender, block.timestamp));
        
        documents[docId] = Document({
            ipfsHash: _ipfsHash,
            timestamp: block.timestamp,
            submitter: msg.sender,
            docType: _docType,
            isVerified: false
        });
        
        emit DocumentSubmitted(docId, _ipfsHash, msg.sender);
        return docId;
    }
    
    function verifyDocument(bytes32 _docId) public {
        require(documents[_docId].timestamp != 0, "Document does not exist");
        documents[_docId].isVerified = true;
        emit DocumentVerified(_docId, msg.sender);
    }
    
    function getDocument(bytes32 _docId) public view returns (
        string memory ipfsHash,
        uint256 timestamp,
        address submitter,
        string memory docType,
        bool isVerified
    ) {
        Document memory doc = documents[_docId];
        return (
            doc.ipfsHash,
            doc.timestamp,
            doc.submitter,
            doc.docType,
            doc.isVerified
        );
    }
}