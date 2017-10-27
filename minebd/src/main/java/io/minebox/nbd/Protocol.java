/*
 * Copyright 2017 Minebox IT Services GmbH
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * Various tools around backups, mostly to get info about them.
 */

package io.minebox.nbd;

public class Protocol {

    /* global flags */
    public static final int NBD_FLAG_FIXED_NEWSTYLE = 1 << 0; /* new-style export that actually supports extending */
    public static final int NBD_FLAG_NO_ZEROES = 1 << 1; /* we won't send the 128 bits of zeroes if the client sends NBD_FLAG_C_NO_ZEROES */

    /* Options that the client can select to the server */
    public static final int NBD_OPT_EXPORT_NAME = 1;
    /**
     * Client wants to select a named export (is followed by name of export)
     */
    public static final int NBD_OPT_ABORT = 2;
    /**
     * Client wishes to abort negotiation
     */
    public static final int NBD_OPT_LIST = 3;

    /* values for transmission flags field */
    public static final int NBD_FLAG_HAS_FLAGS = (1 << 0); /* Flags are there */
    public static final int NBD_FLAG_READ_ONLY = (1 << 1); /* Device is read-only */
    public static final int NBD_FLAG_SEND_FLUSH = (1 << 2); /* Send FLUSH */
    public static final int NBD_FLAG_SEND_FUA = (1 << 3); /* Send FUA (Force Unit Access) */
    public static final int NBD_FLAG_ROTATIONAL = (1 << 4); /* Use elevator algorithm - rotational media */
    public static final int NBD_FLAG_SEND_TRIM = (1 << 5); /* Send TRIM (discard) */

    /* commands */
    public static final int NBD_CMD_READ = 0;
    public static final int NBD_CMD_WRITE = 1;
    public static final int NBD_CMD_DISC = 2;
    public static final int NBD_CMD_FLUSH = 3;
    public static final int NBD_CMD_TRIM = 4;

    /* response flags */
    public static final int NBD_REP_FLAG_ERROR = (1 << 31);
    /**
     * If the high bit is set, the reply is an error
     */
    public static final int NBD_REP_ERR_UNSUP = (1 | NBD_REP_FLAG_ERROR);
    /**
     * Client requested an option not understood by this version of the server
     */
    public static final int NBD_REP_ERR_POLICY = (2 | NBD_REP_FLAG_ERROR);
    /**
     * Client requested an option not allowed by server configuration. (e.g., the option was disabled)
     */
    public static final int NBD_REP_ERR_INVALID = (3 | NBD_REP_FLAG_ERROR);
    /**
     * Client issued an invalid request
     */
    public static final int NBD_REP_ERR_PLATFORM = (4 | NBD_REP_FLAG_ERROR);

//	https://github.com/NetworkBlockDevice/nbd/blob/master/doc/proto.md

    public static final int NBD_REQUEST_MAGIC = 0x25609513; //
    public static final int REPLY_MAGIC = 0x67446698;
    public static final long NBDMAGIC = 0x4e42444d41474943L; //(ASCII 'NBDMAGIC') (also known as the INIT_PASSWD)
    public static final long IHAVEOPT = 0x49484156454F5054L; // (ASCII 'IHAVEOPT');

    public static final long HANDSHAKE_REPLY_MAGIC = 0x3e889045565a9L;
    public final static int EIO_ERROR = 5;
}
