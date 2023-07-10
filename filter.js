const { ApolloServer, gql } = require('apollo-server');
const { Pool } = require('pg');

const pool = new Pool({
  user: 'your_database_user',
  host: 'your_database_host',
  database: 'your_database_name',
  password: 'your_database_password',
  port: 5432, // or your database port
});

const typeDefs = gql`
  type TableData {
    id: ID!
    column1: String
    column2: String
    # Add more fields for other columns
  }

  type Query {
    tableData(filterColumn: String, filterValue: String): [TableData]
  }
`;

const resolvers = {
  Query: {
    tableData: async (_, { filterColumn, filterValue }) => {
      const client = await pool.connect();
      try {
        let query = 'SELECT * FROM your_table_name';
        let params = [];

        if (filterColumn && filterValue) {
          query += ` WHERE ${filterColumn} = $1`;
          params.push(filterValue);
        }

        const result = await client.query(query, params);
        return result.rows;
      } catch (error) {
        console.error('Error fetching table data:', error);
        throw error;
      } finally {
        client.release();
      }
    },
  },
};

const server = new ApolloServer({ typeDefs, resolvers });

server.listen().then(({ url }) => {
  console.log(`Server running at ${url}`);
});
























import React, { useState } from 'react';
import { ApolloProvider, ApolloClient, InMemoryCache, useLazyQuery } from '@apollo/client';
import { Table, TableHead, TableRow, TableCell, TableBody, TextField, Button } from '@material-ui/core';

const GET_TABLE_DATA = gql`
  query GetTableData($filterColumn: String, $filterValue: String) {
    tableData(filterColumn: $filterColumn, filterValue: $filterValue) {
      id
      column1
      column2
      # Add more fields for other columns
    }
  }
`;

const client = new ApolloClient({
  uri: 'http://localhost:4000',
  cache: new InMemoryCache(),
});

const TableComponent = () => {
  const [filterColumn, setFilterColumn] = useState('');
  const [filterValue, setFilterValue] = useState('');
  const [getTableData, { loading, data }] = useLazyQuery(GET_TABLE_DATA);

  const handleApplyFilter = () => {
    getTableData({
      variables: {
        filterColumn: filterColumn,
        filterValue: filterValue,
      },
    });
  };

  return (
    <div>
      <TextField
        label="Column Name"
        value={filterColumn}
        onChange={(e) => setFilterColumn(e.target.value)}
      />
      <TextField
        label="Value"
        value={filterValue}
        onChange={(e) => setFilterValue(e.target.value)}
      />
      <Button variant="contained" color="primary" onClick={handleApplyFilter}>
        Apply Filter
      </Button>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Column 1</TableCell>
            <TableCell>Column 2</TableCell>
            {/* Add more table header cells for each column */}
          </TableRow>
        </TableHead>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={2}>Loading...</TableCell>
            </TableRow>
          ) : (
            data.tableData.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{row.column1}</TableCell>
                <TableCell>{row.column2}</TableCell>
                {/* Add more table cells for each column */}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

const App = () => {
  return (
    <ApolloProvider client={client}>
      <TableComponent />
    </ApolloProvider>
  );
};

export default App;

