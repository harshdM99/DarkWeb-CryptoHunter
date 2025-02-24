from django.shortcuts import render
from django.http import JsonResponse
from .neo4j_connection import neo4j_conn

def get_transaction_graph(request, address):
    """Fetch transactions for a Bitcoin address and return them as a graph structure."""
    query = """
    MATCH (a:Address {id: $address})-[r:SENT*1..3]->(b)
    RETURN a.id AS sender, b.id AS receiver, r[0].amount AS amount, r[0].txid AS txid
    """
    transactions = neo4j_conn.query(query, {"address": address})

    # Convert to graph format
    nodes = set()
    links = []

    for tx in transactions:
        nodes.add(tx["sender"])
        nodes.add(tx["receiver"])
        links.append({
            "source": tx["sender"],
            "target": tx["receiver"],
            "amount": tx["amount"],
            "txid": tx["txid"]
        })

    return JsonResponse({
        "nodes": [{"id": node} for node in nodes],
        "links": links
    })

def transaction_graph_page(request):
    """Render the transaction graph page."""
    return render(request, "bitcoin/graph.html")
