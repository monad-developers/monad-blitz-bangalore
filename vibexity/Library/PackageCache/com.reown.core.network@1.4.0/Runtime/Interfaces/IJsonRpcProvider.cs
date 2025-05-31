﻿using System;
using System.Threading.Tasks;
using Reown.Core.Common;
using Reown.Core.Network.Models;

namespace Reown.Core.Network
{
    /// <summary>
    ///     The interface that represents a JSON RPC provider
    /// </summary>
    public interface IJsonRpcProvider : IBaseJsonRpcProvider, IModule
    {
        event EventHandler<JsonRpcPayload> PayloadReceived;

        event EventHandler<IJsonRpcConnection> Connected;

        event EventHandler Disconnected;

        event EventHandler<Exception> ErrorReceived;

        event EventHandler<string> RawMessageReceived;

        /// <summary>
        ///     Connect this provider to the given URL
        /// </summary>
        /// <param name="connection">The URL to connect to</param>
        /// <returns>A task that is establishing the connection</returns>
        Task Connect(string connection);

        /// <summary>
        ///     Connect this provider using the providing connection object
        /// </summary>
        /// <param name="connection">The connection object this provider should use</param>
        /// <returns>A task that is establishing the connection</returns>
        Task Connect(IJsonRpcConnection connection);
    }
}