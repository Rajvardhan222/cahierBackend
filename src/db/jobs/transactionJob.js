import  Transaction  from "../../model/transaction.model.js";
import Wallet from "../../model/wallet.model.js";
export default async (payload, helpers) => {
    const { amount,type,category,description,associatedWallet ,endAftertime } = payload;
    let wallet = await Wallet.findByPk(associatedWallet);
    console.log(amount,type,category,description,associatedWallet ,endAftertime);
    if(type == 'I'){
      let transaction = await Transaction.create({
        amount: parseInt(amount),
        category: category,
        description: description || "",
        associatedWallet: associatedWallet,
    repeat :true,
    // repeatFrequency : repeat,
    endAfterFrequency : endAftertime,
        type: "I",
      });

      let updatedWallet = await wallet.update({
        balance: parseInt(parseInt(wallet.balance) + parseInt(amount)),
      });
    }

    else if(type == 'E'){
      let transaction = await Transaction.create({
        amount: parseInt(amount),
        category: category,
        description: description || "",
        associatedWallet: associatedWallet,
        repeat :true,
        // repeatFrequency : repeat,
        endAfterFrequency : endAftertime,
        type: "E",
      });

      wallet.balance -= parseInt(amount);
  if (wallet.balance < 0) {
    transaction.destroy();
    wallet.balance += parseInt(amount);
    
  }
  let updatedWallet = await wallet.save();

    }
       
  
    // Perform your transaction logic here
    console.log(`Processing transaction: ${amount}`);
  
    // Example: Save to the database or perform any other necessary action
    // const db = helpers.getDatabaseClient(); // getDatabaseClient is a helper you can define to get your DB client
    // await db.query('YOUR QUERY HERE');
  };
  