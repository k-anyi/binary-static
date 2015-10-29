var StatementUI = (function(){
    "use strict";
    var tableID = "statement-table";
    var columns = ["date", "ref", "act", "desc", "credit", "bal"];
    var header = ["Date", "Ref.", "Action", "Description", "Credit/Debit", "Balance"];
    var footer = ["", "", "", "", "", ""];

    function createEmptyStatementTable(){
        var localizedHeader = header.map(function(t){ return text.localize(t); });
        localizedHeader[5] = localizedHeader[5] + "(" + TUser.get().currency + ")";

        var metadata = {
            id: tableID,
            cols: columns
        };
        var data = [];
        var $tableContainer = Table.createFlexTable(data, metadata, localizedHeader, footer);
        return $tableContainer;
    }

    function updateStatementTable(transactions){
        Table.appendTableBody(tableID, transactions, createStatementRow);
        updateStatementFooter(transactions);
        $("#" + tableID +">tfoot").show();
    }


    function clearTableContent(){
        Table.clearTableBody(tableID);
        $("#" + tableID +">tfoot").hide();
    }


    function updateStatementFooter(transactions){
        TradeSocket.send({balance: 1, passthrough: {purpose: "statement_footer"}});

        var allCredit = [].slice.call(document.querySelectorAll("td.credit"));
        allCredit = allCredit.map(function(node){return node.textContent;});

        var totalCredit = allCredit.reduce(function(p, c){return p + parseFloat(c);}, 0);
        totalCredit = Number(totalCredit).toFixed(2);

        var $footerRow = $("#" + tableID + " > tfoot > tr").first();
        var creditCell = $footerRow.children(".credit");
        var creditType = (totalCredit >= 0) ? "profit" : "loss";

        creditCell.text(totalCredit);
        creditCell.removeClass("profit").removeClass("loss");
        creditCell.addClass(creditType);
    }

    function createStatementRow(transaction){
        var dateObj = new Date(transaction["transaction_time"] * 1000);
        var momentObj = moment.utc(dateObj);
        var dateStr = momentObj.format("YYYY-MM-DD");
        var timeStr = momentObj.format("HH:mm:ss");

        var date = dateStr + "\n" + timeStr;
        var ref = transaction["transaction_id"];
        var action = StringUtil.toTitleCase(transaction["action_type"]);
        var desc = transaction["longcode"];
        var amount = Number(parseFloat(transaction["amount"])).toFixed(2);
        var balance = Number(parseFloat(transaction["balance_after"])).toFixed(2);

        var creditDebitType = (parseInt(amount) >= 0) ? "profit" : "loss";

        var $statementRow = Table.createFlexTableRow([date, ref, action, desc, amount, balance], columns, "data");
        $statementRow.children(".credit").addClass(creditDebitType);
        $statementRow.children(".date").addClass("break-line");

        return $statementRow[0];        //return DOM instead of jquery object
    }
    
    return {
        clearTableContent: clearTableContent,
        createEmptyStatementTable: createEmptyStatementTable,
        updateStatementTable: updateStatementTable
    };
}());
