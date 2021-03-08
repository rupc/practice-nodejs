var ev = require('events');
var {v4:uuidv4} = require('uuid');

function evtId(txid, pid) {
    return txid+":"+pid;
}

async function main() {
    var sharedPromises = [];
    var peers = ["peer0", "peer1", "peer2", "peer3", "peer4"];
    var counterMap = new Map();
    var txEventer = new ev.EventEmitter();

    const randomTxNum = 5;
    var TxIDes = [];

    // Create Txes
    for (var i = 0; i < randomTxNum; ++i) {
        var txid = uuidv4();
        TxIDes.push(txid);
        sharedPromises[txid] = [];
        counterMap.set(txid, {val:0});
    }
    // console.log(counterMap);

    // 1. (Tx Submission) and wait txid per peer
    TxIDes.forEach((txid) => {
        peers.forEach((pid) => {
            // console.log(pid)
            var p = new Promise((resolve, reject) => {
                var eid = evtId(txid, pid);
                txEventer.on(eid, (resp) => {
                    // console.log("Received resp", resp)
                    counterMap.get(txid).val++;
                    
                    if (counterMap.get(txid).val == peers.length) {
                        console.log("eid:", "receives all replies from all peers!");
                    }
                    resolve();
                });
            });
            sharedPromises[txid][pid] = p
            // sharedPromises[txid].push(p);
        })
        
    });

    var minDelay = 1000, maxDelay = 3000;
    // Async task: Randomly occurs tx commit event (num of peers x num of txes)
    TxIDes.forEach((txid) => {
        var randomDelay = Number(Math.random() * (maxDelay-minDelay) + minDelay);
        peers.forEach((pid) => {
                setTimeout(() => {
                    var eid = evtId(txid, pid);
                    console.log("emit eid:", eid);
                    txEventer.emit(eid, {"txid": txid, "peerid": pid, "reploy_type":"bft-commit"});
                }, randomDelay);
        });
    });

    // console.log(sharedPromises);
    var promisesPerPeer = [];
    // var endP = new Promise(async (resolve, reject) => {
    TxIDes.forEach((txid, index) => {
        peers.forEach((pid) => {
            promisesPerPeer.push(sharedPromises[txid][pid]);
        })

    })

    await Promise.all(promisesPerPeer);
    console.log('end of program', counterMap);
    
    // for (const txid of TxIDes) {
    // while(1){}
}

main();

// console.log(uuidv4());
